var UI = require('ui');
var ajax = require('ajax');
var Feature = require('platform/feature');

var splash = new UI.Card({
  title: 'TVmaze Today',
  titleColor: Feature.color('#3c948b', 'white'),
  subtitle: 'Loading...',
  subtitleColor: 'white',
  backgroundColor: Feature.color('#222222', 'black'),
  status: false
});

splash.show();

var geoOptions = {
  enableHighAccuracy: false,
  maximumAge: 600000,
  timeout: 10000
};

navigator.geolocation.getCurrentPosition(success, function (err) {
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

  ajax({
    url: 'http://nominatim.openstreetmap.org/reverse?format=json&lat=' + lat + '&lon=' + lon,
    type: 'json'
  }, function(data) {
    country_code = data.address.country_code.toUpperCase();
    country = data.address.country;

  ajax({
    url: 'http://api.tvmaze.com/schedule?country=' + country_code,
    type: 'json'
  }, function(data) {
    var schedule = data.map(function(obj) {
      return {
        show: obj.show.name,
        name: obj.name,
        network: obj.show.network.name,
        airtime: obj.airtime ? obj.airtime : 'N/A',
        runtime: obj.runtime ? obj.runtime + ' min' : 'N/A'
      };
    });

    var menu = new UI.Menu({
      highlightBackgroundColor: Feature.color('#3c948b', 'black'),
      highlightTextColor: 'white',
      sections: [{
        title: 'TVmaze Today: ' + country_code,
        textColor: '#3c948b',
        backgroundColor: '#222222',
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
        subtitle: item.network,
        subtitleColor: Feature.color('#3c948b', 'black'),
        body: 'Time: ' + item.airtime + '\nLength: ' + item.runtime,
        bodyColor: Feature.color('#222222', 'black'),
        scrollable: true
      });
      card.show();
    });

    menu.show();
    splash.hide();

    }, function(err) {
      console.log('Error: ' + err.message);
    });

  }, function(err) {
    var error = new UI.Card({
      title: 'Error',
      body: 'Could not determine country.'
    });
    error.show();
  });

}
