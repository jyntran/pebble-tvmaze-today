var UI = require('ui');
var ajax = require('ajax');
var Feature = require('platform/feature');

var Clay = require('./clay');
var clayConfig = require('./config.json');
var clay = new Clay(clayConfig, null, { autoHandleEvents: false });
var Settings = require('settings');


var country = Settings.option('country');
if (!country) {
  Settings.option('country', 'US');
}

var splash = new UI.Card({
  title: 'TVmaze Today',
  titleColor: Feature.color('#3c948b', 'black'),
  banner: Feature.color('IMAGE_TVMAZE_80', 'IMAGE_TVMAZE_BW_80'),
  status: false
});

splash.show();

var tvmaze = function(country_code) {    
  ajax({
    url: 'http://api.tvmaze.com/schedule?country=' + country_code,
    type: 'json'
  }, function(data) {
  var schedule = data.map(function(obj) {
    return {
      show: obj.show.name,
      network: obj.show.network.name,
      airtime: obj.airtime ? obj.airtime : 'N/A',
      runtime: obj.runtime ? obj.runtime + ' minutes' : 'N/A',
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
      titleColor: Feature.color('#3c948b', 'black'),
      body: 'Network: ' + item.network + '\nTime: ' + item.airtime + '\nLength: ' + item.runtime,
      bodyColor: '#222222',
      scrollable: true
    });
    card.show();
  });

  menu.show();
  splash.hide();  
  }, function(err) {
    console.log('Error: ' + err.message);
  });
};


Pebble.addEventListener('showConfiguration', function(e) {
  Pebble.openURL(clay.generateUrl());
});


Pebble.addEventListener('webviewclosed', function(e) {
  if (e && !e.response) {
    return;
  }
  
  var dict = clay.getSettings(e.response);
  Settings.option(dict);
  Settings.option('country', Settings.option('country').toUpperCase());
  tvmaze(Settings.option('country')); 
});
 

Pebble.addEventListener('ready', function() {
  tvmaze(Settings.option('country'));  
});

