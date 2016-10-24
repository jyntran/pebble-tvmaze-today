var UI = require('ui');
var ajax = require('ajax');

var geoOptions = {
  enableHighAccuracy: true,
  maximumAge: 10000,
  timeout: 10000
};

var splash = new UI.Card({
  title: 'TVmaze Today',
  subtitle: 'Fetching location...'
});

splash.show();

navigator.geolocation.getCurrentPosition(success,                                         
function (err) {
  console.log('location error (' + err.code + '): ' + err.message);
  var error = new UI.Card({
    title: 'Error',
    body: 'Could not determine location.'
  });
  error.show();
}, geoOptions);

function success(pos) {
  var lat = pos.coords.latitude;
  var lon = pos.coords.longitude;
  var country_code, country;

var tvmaze = function() {  
ajax({
  url: 'http://api.tvmaze.com/schedule?country=' + country_code,
  type: 'json'
},
function(data) {
  var schedule = data.map(function(obj) {
    return {
      show: obj.show.name,
      name: obj.name,
      network: obj.show.network.name,
      airtime: obj.airtime ? obj.airtime : 'N/A',
      runtime: obj.runtime ? obj.runtime : 'N/A',
    };
  });
  
  var menu = new UI.Menu({
    sections: [{
      title: country,
      items: schedule.map(function(obj) {
        return {
          title: obj.show,
          subtitle: obj.airtime
        };
      })
    }]
  });
     
  menu.on('select', function(e) {
    var item  = schedule[e.itemIndex];
    var card = new UI.Card({
      title: item.show,
      subtitle: item.name,
      body: 'Network: ' + item.network + '\nTime: ' + item.airtime + '\nLength: ' + item.runtime + ' minutes',
      scrollable: true
    });
    card.show();
  });
  
  menu.show();  
  splash.hide();
},
function(err) {
  console.log('Error: ' + err.message);
});  
};

var getCountry = function() {
  ajax({
    url: 'http://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lon,
    type: 'json'
  }, function(data) {
    country_code = data.address.country_code.toUpperCase();
    country = data.address.country;
    tvmaze();
  }, function(err) {
    country_code = 'US';
    country = 'United States of America';
    tvmaze();
  });
};

getCountry();
    
}