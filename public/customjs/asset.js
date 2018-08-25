var map = L.map('map').setView([63.429200, 10.394146], 14);
var OpenStreetMap_Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var Stamen_Watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	subdomains: 'abcd',
	minZoom: 1,
	maxZoom: 16,
	ext: 'png'
});

// ADDING SCALE
L.control.scale({imperial:false}).addTo(map);

// ADDING LEGEND
var legend = L.control({position: 'bottomright'});

// make this dynamic from getColor
function getLegendColor(d) {
  return d ==  'Sandfang' ? '#ff0000' :
         d ==  'Bisluk' ? '#0000ff' :
         d ==  'Strindasluk' ? '#ffff00' :
                    '#FFEDA0';
}


legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
    grades = ['Sandfang', 'Bisluk', 'Strindasluk'],
    labels = [];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getLegendColor(grades[i]) + '"></i> ' +
            grades[i] + '<br>';
}

return div;
};

legend.addTo(map);




let basemaps = L.layerGroup()
.addLayer(OpenStreetMap_Mapnik) // default layer to show
.addTo(map);

$(".dropdown-item.bg").click(function(event) {
  event.preventDefault();
  let selectedLayer = ($(this).attr("value")); // return string

  layer = $(this).data('foo', {OpenStreetMap_Mapnik: 'bar'});
  obj = ($(this).data('foo'));
  console.log(typeof(obj['bar']));
  console.log($(this).data('foo'));
  console.log(typeof(Object.keys(obj)[0]));

  // var my_object = {};
  // var prop = 'layer';
  // my_object[prop] = selectedLayer;

  basemaps.clearLayers()
  basemaps.addLayer(selectedBaseLayer(selectedLayer));
});

function selectedBaseLayer(layer) {
  switch (layer) {
    case 'OpenStreetMap_Mapnik': return OpenStreetMap_Mapnik;
    case 'Stamen_Watercolor': return Stamen_Watercolor;
    default: return 'Ukjent';
  };
};

// Holder for temporary position for new poi shown as red pin
// before sending to database
let tempMarker;
// Id of latest clicked marker. Used when updating skade and tomming
// can probably be refactored better
let current_id;

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

// assign color to marker
function getColor(asset) {
  switch (asset) {
    case 'sandfang':
      return "#ff0000";
    case 'bisluk':
      return "#0000ff";
    case 'strindasluk':
      return "#ffff00"
  }
}

// CREATE LAYERS TO BE POPULATED
var sandfang = new L.geoJson(null, {
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
    //layer.on('click', onClick);
  }
});
var bisluk = new L.geoJson(null, {
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
var strindasluk = new L.geoJson(null, {
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

sandfang.on('click', markerOnClick);
bisluk.on('click', markerOnClick);
strindasluk.on('click', markerOnClick);

function markerOnClick(e) {
  current_id = e.layer.feature.properties.id;
  console.log(current_id)
  showInfo(current_id, e.layer.feature);
}

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


// get feature of layer to be used to fill modal!
// THIS WORKS but should probably be refactored...
function showInfo(current_id, layer) {
  console.log(layer)
  // Make ajax call to populate lists

  //current_id = e.layer.feature.properties.id;

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
        let date = '<i class="far fa-calendar-alt"></i>' + ' ' + dager[regdato.getDay()] + ' ' + regdato.getDate() + '.' + (regdato.getMonth() + 1) + '.' + regdato.getFullYear() + ' <i class="far fa-clock"></i>' + ' ' + regdato.getHours() + '.' + (`0${regdato.getMinutes()}`).slice(-2);
        i += 1;
        $('#sandfangLogTable > tbody').append(
          `
        <tr>
          <th scope="row">${String(i)}</th>
          <td></i>${date}</td>
          <td>${renameFylling(tomming.fyllingsgrad)}</td>
        </tr>
        `
        );
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
        let skaderid = skade.skader_id;
        let rename = renameSkade(skade.skade_type);
        $('.list-group.skadeLog').append(
          `
          <li class="list-group-item list-group-item-action">
          <span>
            ${rename}
          </span> 
          <form action="api/pois/skade/${skade.skader_id}/edit" class="edit-skader-form">
              <input type="hidden" value="${skade.skade_type}" name="skade_type">
              <input type="hidden" value="${skade.skader_id}" name="skader_id">
              <input type="hidden" value="true" name="reparert">          
              <button type="submit" class="btn btn-danger btn-sm float-right">Fjern skade</button> 
          </form>   
          </li>
          `
        );
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
  $(".featureType").append(layer.properties.asset_type);

  $(".featureId").append(current_id);
  $(".featurePlace").append(layer.properties.place);
  let regdato = new Date(layer.properties.regdate);
  $(".featureRegdate").append(regdato.getDate() + '.' + (regdato.getMonth() + 1) + '.' + regdato.getFullYear());
  $("#infoModal").modal();
  objectType = layer.properties.asset_type;
};

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

function renameFylling(fylling) {
  switch (fylling) {
    case '0': return 'Tom';
    case '1': return '1:3';
    case '2': return '2:3';
    case '3': return 'Full';
    default: return 'Noe gikk galt :(';
  };
};

// Remove selectable values from damages that has already been registered
function hideRegisteredSkade(val) {
  // return element that has value
  // need to be specific to which checkboxes
  $('input[type="checkbox"]').filter(function() {
      return this.value == val;
  }).next().hide();
  //console.log(val);
}

//attach submit listener to the edit-skader-form
// make user verify he/she want mark a damage as repaired
$('#registrert-skader-list').on('submit', '.edit-skader-form', function(e) {
  e.preventDefault();
  let confirmResponse = confirm('Er du sikker att du har repapert skaden?');
  if(confirmResponse) {
    let skade = $(this).serialize();
    let actionUrl = $(this).attr('action');
    $originalItem = $(this).parent('.list-group-item');
    console.log(skade);
    $.ajax({
      url: actionUrl,
      data: skade,
      type: 'PUT',
      originalItem: $originalItem,
      success: function(data) {
        console.log(data);
        $originalItem.remove();
      }
    })
  }
});

// add all pois
$.get({ url: '/api/pois/'})
  .done(function (data) {
    getAssets(data);
    sandfang.addTo(map);
  })
  .fail(function (jqXHR, status, error) {
    console.log('Status: ' + status + '\n' + 'Error: ' + error);
  });


// save new object based on object type
$('#newPoiForm').submit(function (e) { // handle the submit event
  e.preventDefault();
  let formData = $(this).serialize();
  // post new asset and add the latest point on the map

  $.post({type: 'POST', url: '/api/pois/', data: formData}).then(function(data){
    console.log('New asset submitted');
    return $.get({url: '/api/pois/last'});
  }).then(function(data, textStatus, xhr) {
    console.log(data);

    if (xhr.status === 200) {
      console.log(`Status code ${xhr.status}`);
      getAssets(data)
    } else {
      alert(`Noe gikk feil, status code: ${xhr.status}`);
    }
  })
})

// add markers to map filtered on asset type
function getAssets(data){
  $(data.features).each(function (key, data) {
    switch (data.properties.asset_type) {
      case 'bisluk': bisluk.addData(data); break; 
      case 'sandfang': sandfang.addData(data); break;
      case 'strindasluk': strindasluk.addData(data); break;
      default: console.log('wrong asset type ' + data.properties.asset_type);
    };
  })
}

// submitting new damage
$('#registrerSkadeForm').submit(function (e) {
  e.preventDefault();

 // let = selectedDamage $("input:checkbox[name=type]:checked").map(function(){return $(this).val()}).get()
  let = selectedDamage = $("input:checkbox[name=skade_type]:checked").map(function () {
    console.log('selected damage to post ' + $(this).val());
    return $(this).val();
  }).get();

  let object = {}
  object.poi_id = current_id;
  object.skade_type = selectedDamage;
  console.log(object);
  skaderJSON = JSON.stringify(object);
  postDamage(skaderJSON);
});


function postDamage(damage) {
  console.log(damage);
  $.ajax({
      type: "POST",
      url: '/api/pois/skade',
      data: damage,
      contentType: "application/json; charset=utf-8",
    }).done(function (skade) {
    console.log(skade);
    console.log('ajax is done getting back data aka, success');
    skade.forEach(function(e) {
      let items = [];
      console.log(e.skade_type);
      // add form to the new item, make sure the submit listener also work on these new elements!
      items.push(
        `
        <li class="list-group-item list-group-item-action">
          <span>
          ${renameSkade(e.skade_type)}
          </span> 
          <form action="api/pois/skade/${e.skader_id}/edit" class="edit-skader-form">
              <input type="hidden" value="${e.skade_type}" name="skade_type">
              <input type="hidden" value="${e.skader_id}" name="skader_id">
              <input type="hidden" value="true" name="reparert">          
              <button type="submit" class="btn btn-danger btn-sm float-right">Fjern skade</button> 
          </form>   
        </li>
        `
        )
      hideRegisteredSkade(e.skade_type);
      $('.list-group.skadeLog').append(( items.join('') ));
    })
  }
);
  // clear skade form
  $('#registrerSkadeForm').trigger("reset");
  // hide reg skade form
  $('#editSandfangSkade').hide();
  $('#sandfangSkadeInfo').show();
 }

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
      let date = '<i class="far fa-calendar-alt"></i>' + ' ' + dager[regdato.getDay()] + ' ' + regdato.getDate() + '.' + (regdato.getMonth() + 1) + '.' + regdato.getFullYear() + ' <i class="far fa-clock"></i>' + ' ' + regdato.getHours() + '.' + (`0${regdato.getMinutes()}`).slice(-2);

      // add latest tomming to table
      $('#sandfangLogTable > tbody').append(
        `
        <tr>
          <th scope="row">${String(rows)}</th>
          <td>${date}</td>
          <td>${renameFylling(fyllingsgrad)}</td>
        </tr>
        `
      );
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

function checkedFilter() {
  var filterItem = [];
  $('input[name=filterItem]:checked').map(function() {
    filterItem.push($(this).val());
  });
  console.log(filterItem)
}

// Interact with checkboxes
$('#sandfang-checkbox').change(function() {
  if (this.checked) {
    map.addLayer(sandfang);
  } else {
    map.removeLayer(sandfang);
  }
});
$('#bisluk-checkbox').change(function() {
  if (this.checked) {
    console.log('add bisluk');
    map.addLayer(bisluk);
  } else {
    map.removeLayer(bisluk);
    console.log('remove bisluk');
  }
});
$('#strindasluk-checkbox').change(function() {
  if (this.checked) {
    console.log('add strindasluk');
    map.addLayer(strindasluk);
  } else { 
    map.removeLayer(strindasluk);
    console.log('remove strindasluk');
  }
});
$('#allatyper-checkbox').change(function() {
  if (this.checked) {
    map.addLayer(sandfang);
    map.addLayer(bisluk);
    map.addLayer(strindasluk);
  } else {
    map.removeLayer(sandfang);
    map.removeLayer(bisluk);
    map.removeLayer(strindasluk);
  }
});

$('#allatyper-checkbox').on('click', function() {
  if (this.checked == true)
      $('.asset-checkbox').find('input[name="filtercheckbox"]').prop( "checked", true );
      //$('input[name="filtercheckbox"]').prop( "checked", true );
  else
      $('.asset-checkbox').find('input[name="filtercheckbox"]').prop('checked', false);
      //$('input[name="filtercheckbox"]').prop( "checked", false );
});

$('#myDropdown').on('click', function(event) {
  event.stopPropagation();
});