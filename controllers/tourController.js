const Tour = require('./../models/tourModel');
const APIFeatures = require('./../units/apiFeatures')
const catchAsync = require('./../units/catchAsync');
const AppError = require('./../units/appError');
const factory = require('./handlerFactory');
const Units = require('units');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5'
  req, query.sort = '-ratingsAverage,price'
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};


exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews '});
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      }
    },
    {
      $sort: { avgPrice: 1 }
    },
    
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1; //2021

  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      $project: {
        _id: 0
      }
    },
    {
      $sort: { numTourStarts: -1 }
    },
    {
      $limit: 12
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      plan
    }
  });
});


// /tours-Within/:distance/center/:latlang/units/:units
// /tours-within/233/center/34.111745,-118.1113491/units/mi
exports.getToursWithin =catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
   const [lat, lng] = latlng.split(',');

    const radius = Units ==='mi' ? distance / 3963.2 : distance / 6378.1;

   if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitutr and longitude in the format lat,lng,',
        400
      )
    );
   }

    const tours = await Tour.find({ 
      startLocation: { $geoWithin: { $centerSphere:[ [lng, lat], radius] } }
    });     

   res.status(200).json({
    status:'success',
    result: tours.length,
    data: {
      data: tours
    }
   });
});
 exports.getDistance = catchAsync(async (req, res, next) => {
  const {latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');

  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

  if (!lat || !lng) {
   next(
     new AppError(
       'Please provide latitutr and longitude in the format lat,lng,',
       400
     )
   );
  }

  const distances = await Tour.aggregate([
    {
      $geoNear: {
        near: {
          type:"Point",
          coordinates:[lng * 1, lat * 1]
        },
        distanceField: 'distance',
        distanceMultiplier: multiplier
      }
    },
    {
      $project:{
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status:'success',
    data: {
      data: distances
    }
   });
 });