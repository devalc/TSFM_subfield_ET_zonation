// ==========================================================
// OpenET Monthly ETa Export (April–October, 2000–2024)
// Extent: Bounding Box of 'cafe' Asset
// ==========================================================

//⃣ Load your field asset and get the rectangular bounding box
var cafe = ee.FeatureCollection("projects/ee-chinmaydeval91/assets/cafe");
var exportRegion = cafe.geometry().bounds();

//⃣ Load OpenET monthly ET dataset (Units: mm/month)
var dataset = ee.ImageCollection('OpenET/ENSEMBLE/CONUS/GRIDMET/MONTHLY/v2_0')
                .select('et_ensemble_mad');

//️⃣ Nested Loop: Years (2000-2024) and Months (4-10)
for (var year = 2000; year <= 2024; year++) {
  
  for (var month = 4; month <= 10; month++) {
    
    var startDate = ee.Date.fromYMD(year, month, 1);
    var endDate = startDate.advance(1, 'month');
    
    // Filter the collection for the specific month
    var monthlyCol = dataset.filterDate(startDate, endDate);
    
    // Use .getInfo() to check if data exists before creating a task
    var count = monthlyCol.size().getInfo();
    
    if (count > 0) {
      // cast to float.
      // NOTE: We are NOT using .clip(cafe) here so you get the full rectangular area.
      var monthlyET = monthlyCol.mean().toFloat();

      var monthStr = month < 10 ? '0' + month : '' + month;
      var taskName = 'ET_Monthly_' + year + '_' + monthStr;

      //⃣ Export to Google Drive
      Export.image.toDrive({
        image: monthlyET,
        description: taskName,
        folder: 'OpenET_Monthly_Full_Extent',
        fileNamePrefix: taskName,
        region: exportRegion, // This defines the "frame" of  exported tif
        scale: 30,            // 30m pixels
        crs: 'EPSG:4326',
        maxPixels: 1e13
      });
      
      print('Task ready for: ' + taskName);
      
    } else {
      print('No data found for: ' + year + '-' + month);
    }
  }
}

//⃣ Visualization (Checking a recent month)
var checkImg = dataset.filterDate('2023-07-01', '2023-08-01').mean();
Map.centerObject(cafe, 12);
Map.addLayer(checkImg, {min: 0, max: 250, palette: ['blue', 'green', 'yellow', 'red']}, 'July 2023 ET');
// Adding the field outlines for reference only
Map.addLayer(cafe.style({color: 'white', fillColor: '00000000'}), {}, 'Field Boundaries');
