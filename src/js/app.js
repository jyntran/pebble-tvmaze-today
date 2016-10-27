var UI = require('ui');
var ajax = require('ajax');

var Clay = require('./clay');
var clayConfig = require('./config.json');
var clay = new Clay(clayConfig, null, { autoHandleEvents: false });
var Settings = require('settings');


var country = Settings.option('country');
if (!country) {
  Settings.option('country', 'US');
}

var tvmaze = function(country_code) {    
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
      runtime: obj.runtime ? obj.runtime + ' minutes' : 'N/A',
    };
  });
  
  var menu = new UI.Menu({
    sections: [{
      title: 'TVmaze Today: ' + country_code,
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
      body: 'Network: ' + item.network + '\nTime: ' + item.airtime + '\nLength: ' + item.runtime,
      scrollable: true
    });
    card.show();
  });

  menu.show();  
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
 
  tvmaze(Settings.option('country')); 
});
 
/*
Pebble.addEventListener('appmessage', function(e) {
  var dict = e.payload;
  console.log('Got message: ' + JSON.stringify(dict));
  
  if (dict['country']) {
    country = dict['country'].toUpperCase();
  } else {
    console.log('not a country setting');
  }
});
*/

Pebble.addEventListener('ready', function() {
  tvmaze(Settings.option('country'));  
});

