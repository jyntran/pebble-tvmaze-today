/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var ajax = require('ajax');

ajax({
  url: 'http://api.tvmaze.com/schedule?country=CA',
  type: 'json'
},
function(data) {
  var schedule = data.map(function(obj) {
    return {
      show: obj.show.name,
      name: obj.name,
      airtime: obj.airtime,
      runtime: obj.runtime
    };
  });
  
  var menu = new UI.Menu({
    sections: [{
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
      body: 'Time: ' + item.airtime + '\nLength: ' + item.runtime + ' mins',
      scrollable: true
    });
    card.show();
  });
  menu.show();  
},
function(err) {
  console.log('Error: ' + err);
});