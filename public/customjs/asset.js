var map = L.map('map').setView([63.429200, 10.394146], 14);
var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

// Click edit button to hide list and show form
$("#btnEditSandfangInfo").click(function (e) {
  $('#sandfangInfo').hide();
  $('#editSandfangInfo').show();
})

// If avbrut if clicked go back to info list
$('#hideEditSandfangInfoForm').click(function (e) {
  $('#sandfangInfo').show();
  $('#editSandfangInfo').hide();
})

// Click edit button to hide list and show form
$('#btnEditSandfangSkade').click(function (e) {
  $('#sandfangSkadeInfo').hide();
  $('#editSandfangSkade').show();
});

// SKADE - If avbrut if clicked go back to info list
$('#hideEditSandfangSkadeForm').click(function (e) {
  $('#sandfangSkadeInfo').show();
  $('#editSandfangSkade').hide();
});

function getColor(asset) {
  switch (asset) {
    case 'sandfang':
      return "#ff0000";
    case 'bisluk':
      return "#0000ff";
    case 'strindasluk':
      return "#00ff00"
    default:
      return '#ffff00';
  }
}

var poi = new L.geoJson(null, {
  pointToLayer: function (feature, latlng) {
    return L.circleMarker(latlng, {
      radius: 10,
      fillOpacity: 0.5,
      color: getColor(feature.properties.asset_type)
    });
  },
  onEachFeature: function (feature, layer) {
    //layer.bindPopup(feature.properties.place);
    layer.bindTooltip(feature.properties.id + '', {
      sticky: true,
      direction: 'top'
    });
  }
});

var tempIcon = L.icon({
  iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  //iconUrl: 'https://png.pngtree.com/element_pic/17/04/18/c631b7cf64373bdb37049a3bb250dd9a.jpg',
  //shadowUrl: 'leaf-shadow.png',
  iconSize: [400, 250],
  iconSize: [25, 41],
  //iconAnchor: [200, 125],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

let tempMarker;
let current_id;

// get feature of layer to be used to fill modal!
poi.on('click', function (e) {
  // Make ajax call to populate lists

  current_id = e.layer.feature.properties.id;

  // get tomming
  let url = '/api/pois/tomming/' + current_id;
  $.get({
      url: url
    })
    .done(function (data) {
      let i = 0;
      var dager = ["Søndag", "Mondag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
      data.forEach(function (tomming) {
        let regdato = new Date(tomming.regdato);
        let date = dager[regdato.getDay()] + ' ' + regdato.getDate() + '.' + (regdato.getMonth() + 1) + '.' + regdato.getFullYear() + ' <strong>kl.</strong>' + regdato.getHours() + '.' + (`0${regdato.getMinutes()}`).slice(-2);
        i += 1;
        $('#sandfangLogTable > tbody').append('<tr><th scope="row">' + String(i) + '</th><td>' + date + '</td><td>' + tomming.fyllingsgrad + '</td></tr>');
      })
    })
    .fail(function (jqXHR, status, error) {
      console.log('Status: ' + status + '\n' + 'Error: ' + error);
    });

  let urlSkade = '/api/pois/skade/' + current_id;
  $.get({
      url: urlSkade
    })
    .done(function (data) {
      // add skade to list
      console.log(data);
      data.forEach(function (skade) {
        let rename = renameSkade(skade.skade_type);
        $('.list-group.skadeLog').append('<li class="list-group-item list-group-item-action">' + rename + '<button type="button" class="btn btn-danger btn-sm float-right">Skade reparert</button></li>');
        // hide checkbox in form where if skade is already registered
        hideRegisteredSkade(skade.skade_type);
      });
    })
    .fail(function (jqXHR, status, error) {
      console.log('Status: ' + status + '\n' + 'Error: ' + error);
    });

  $(".featureType").text('');
  $(".featureId").text('');
  $(".featurePlace").text('');
  $(".featureRegdate").text('');
  $(".featureType").append(e.layer.feature.properties.asset_type);

  $(".featureId").append(current_id);
  $(".featurePlace").append(e.layer.feature.properties.place);
  let regdato = new Date(e.layer.feature.properties.regdate);
  $(".featureRegdate").append(regdato.getDate() + '.' + (regdato.getMonth() + 1) + '.' + regdato.getFullYear());
  $("#infoModal").modal();
  objectType = e.layer.feature.properties.asset_type;
});

function renameSkade(skade) {
  switch (skade) {
    case 'feil_lokk': return 'Feil Lokk';
    case 'skadet_lokk': return 'Skadet Lokk';
    case 'manglendeDykkert': return 'Manglende dykkert';
    case 'tett_stikkledning': return 'Tett stikkledning';
    case 'tett_utlopp': return 'Tett utløp';
    case 'skadet_kumrug': return 'Skadet kumrug';
    default: return 'Ukjent';
  };
};

// hide element with value of val
function hideRegisteredSkade(val) {
  // return element that has value
  // need to be specofic to which checkboxes
  $('input[type="checkbox"]').filter(function() {
      return this.value == val;
  }).next().hide();
  console.log(val);
  //.hide();
}

poi.addTo(map);

// add all pois
$.get({
    //dataType: 'json',
    url: '/api/pois/'
  })
  .done(function (data) {
    $(data.features).each(function (key, data) {
      poi.addData(data);
    });
  })
  .fail(function (jqXHR, status, error) {
    console.log('Status: ' + status + '\n' + 'Error: ' + error);
  });


// WORKING!!
// save new object based on object type
$('#newPoiForm').submit(function (e) { // handle the submit event
  e.preventDefault();
  let formData = $(this).serialize();
  console.log(formData);

  $.post({
      type: 'POST',
      url: '/api/pois/',
      data: formData
    })
    .done(function (data) {
      // $("#newPoiForm").trigger("reset");
      map.removeLayer(crosshair);
      console.log('submitted');

    })
    .fail(function (xhr) {
      console.log('something went wrong', xhr);
      //console.log(data);
    })
    .then(function (data) {
      $.get({
          url: '/api/pois/last'
        })
        .done(function (data, jqxhr) {
          $(data.features).each(function (key, data) {
            // add last to poi
            console.log(status);
            console.log(jqxhr);
            console.log('last point added, hurrah!');
            poi.addData(data);
          })
        })
        .fail(function (xhr) {
          console.log('error callback add last point', xhr);
        });
    });
});

$('#registrerSkadeForm').submit(function (e) {
  e.preventDefault();

  //let formData = $(this).serializeArray();
  let selectedIds = $("input:checkbox:checked").map(function () {
    return $(this).val();
  }).get();
  console.log(selectedIds);

  selectedIds.forEach(function (selected) {

    // create empty object
    let sendObject = {};

    // add to that object
    sendObject["skade_type"] = selected;
    sendObject["poi_id"] = current_id;

    console.log(sendObject);
  
    $.post({
      type: 'POST',
      url: '/api/pois/skade',
      data: sendObject
    }).
    done(function (skade) {
      let items = [];

      items.push('<li class="list-group-item list-group-item-action">' + renameSkade(skade[0].skade_type) + '<button type="button" class="btn btn-danger btn-sm float-right">Skade reparert</button></li>')
      hideRegisteredSkade(skade[0].skade_type);
      $('.list-group.skadeLog').append(( items.join('') ));
    });

    // this might all be able to go inside the then or done state
    // clear skade form
    $('#registrerSkadeForm').trigger("reset");
    // hide reg skade form
    $('#editSandfangSkade').hide();
    $('#sandfangSkadeInfo').show();
  });

});

$('#registrerTommingForm').submit(function (e) {
  e.preventDefault();
  let formData = $(this).serializeArray();
  formData.push({
    name: 'poi_id',
    value: current_id
  });
  console.log(formData);
  // does not work, need to append the id that was clicked somehow!?
  //console.log(e.layer.feature.properties.id);
  let fyllingsgrad = formData[0].value;
  console.log(fyllingsgrad);

  $.post({
      type: 'POST',
      url: '/api/pois/tomming',
      data: formData
    })
    .done(function () {
      // reset formData
      $('#registrerTommingForm').trigger("reset");
      // add new tomming to list

      // find how many rows table has
      let rows = $('#sandfangLogTable tr').length;
      //$('#myTable tr').size()
      console.log(rows);
      // fill in regdato (this can be refactored)
      var dager = ["Søndag", "Mondag", "Tirsdag", "Onsdag", "Torsdag", "Fredag", "Lørdag"];
      let regdato = new Date();
      let date = dager[regdato.getDay()] + ' ' + regdato.getDate() + '.' + (regdato.getMonth() + 1) + '.' + regdato.getFullYear() + ' <strong>kl.</strong>' + regdato.getHours() + '.' + (`0${regdato.getMinutes()}`).slice(-2);
      // get tomming value that was selected
      $('#sandfangLogTable > tbody').append('<tr><th scope="row">' + String(rows) + '</th><td>' + date + '</td><td>' + fyllingsgrad + '</td></tr>');
    })
});

// when infoModal close do actions
$('#infoModal').on('hidden.bs.modal', function () {
  // Make first tab active in modal
  $('#sandfangLogTable > tbody > tr:nth-child(n+1)').remove(); // clear Tømming log table
  $('a.nav-item').removeClass('active');
  $('a.nav-item:first').addClass('active');

  // Clear Skade table
  $('.list-group.skadeLog > li:nth-child(n+2)').remove();

  // Make first tab pane active in Modal
  $('.tab-pane').removeClass('active');
  $('#sandfang.tab-pane').addClass('active');

  // reset to show all checkboxes when modal close
  $('#registrerSkadeForm label').show();

  // Make sure skade info is shown after the modal is closed
  $('#editSandfangSkade').hide();
  $('#sandfangSkadeInfo').show();
});

// click lagre object
$('#lagreObject').click(function () {
  $('#confirm-object').modal('hide');
  $('#newPoiForm').submit(); // trigger the submit event
  console.log("clicked");
  // remove poi

})

// remove tempMarker when selectObject modal close
$('#confirm-object').on('hide.bs.modal', function (e) {
  if (tempMarker != undefined) {
    map.removeLayer(tempMarker);
  };
});

// Add Easy button to Canvas
let getCoortdinatesButton = L.easyButton('fa-crosshairs fa-lg', function (btn, map) {
  $("input#y-coord").val(map.getCenter().lat.toString());
  $("input#x-coord").val(map.getCenter().lng.toString());

  let lat = map.getCenter().lat;
  let long = map.getCenter().lng;

  // if (tempMarker != undefined) {
  //         map.removeLayer(tempMarker);
  //   };

  // add the temp marker
  tempMarker = L.marker([lat, long], {
    icon: tempIcon
  }).addTo(map);

  $("#confirm-object").modal();
  $(".objectToCreate").text('');
  selectedobject = $("input[name='asset_type']:checked").val();
  // append object name to create to modal
  $(".objectToCreate").append(selectedobject);
  getCoortdinatesButton.disable();
}).disable().addTo(map);

//
$('#formPinButton').click(function () {
  crosshair.addTo(map);
  getCoortdinatesButton.enable();
});

$('#confirm-object').on('hidden.bs.modal', function () {
  map.removeLayer(crosshair);
  // do something…
});

// Add in a crosshair for the map
let crosshairIcon = L.icon({
  iconUrl: '/images/crosshair.png',
  className: 'crosshairIcon',
  iconSize: [100, 100], // size of the icon
  iconAnchor: [50, 50], // point of the icon which will correspond to marker's location
});
crosshair = new L.marker(map.getCenter(), {
  icon: crosshairIcon,
  clickable: false
});

// Move the crosshair to the center of the map when the user pans
map.on('move', function (e) {
  crosshair.setLatLng(map.getCenter());
});