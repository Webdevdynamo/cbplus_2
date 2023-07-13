// ==UserScript==
// @name         cbplus2.0
// @namespace    https://github.com/Webdevdynamo/
// @downloadURL  https://raw.githubusercontent.com/Webdevdynamo/cbplus_2/main/index.js
// @updateURL  https://raw.githubusercontent.com/Webdevdynamo/cbplus_2/main/index.js
// @version      2.0.3
// @description  Better Chaturbate!
// @author       ValzarMen
// @match      https://www.chaturbate.com/*
// @match      https://chaturbate.com/*
// @require      https://raw.githubusercontent.com/Webdevdynamo/cbplus_2/main/require/video.min.js
// @require      https://raw.githubusercontent.com/Webdevdynamo/cbplus_2/main/require/jquery.min.js
// @require      https://raw.githubusercontent.com/Webdevdynamo/cbplus_2/main/require/jquery-ui.min.js
// @resource     vjCSS https://raw.githubusercontent.com/Webdevdynamo/cbplus_2/main/resource/video-js.css
// @resource     jqCSS https://raw.githubusercontent.com/Webdevdynamo/cbplus_2/main/resource/jquery-ui.css
// @resource     cbCSS https://raw.githubusercontent.com/Webdevdynamo/cbplus_2/main/resource/cbplus.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

'use strict';

GM_addStyle (GM_getResourceText("vjCSS"));
GM_addStyle (GM_getResourceText("jqCSS"));
GM_addStyle (GM_getResourceText("cbCSS"));

const globals = {};

globals.template = $('<li class="room_list_room roomCard" style="cursor: pointer;"><a href="/blondefoxsilverfox/" target="_blank" data-room="blondefoxsilverfox" class="no_select"><img src="https://roomimg.stream.highwebmedia.com/riw/blondefoxsilverfox.jpg?1688693700" width="180" height="101" alt="blondefoxsilverfox\'s chat room" class="png room_thumbnail" onmouseenter="window[\'tsExec\'] &amp;&amp; tsExec(function(ts){ event &amp;&amp; ts.roomReload.startStreaming(\'blondefoxsilverfox\', event.currentTarget) })" onmouseleave="window[\'tsExec\'] &amp;&amp; tsExec(function(ts){ ts.roomReload.stopStreaming(\'blondefoxsilverfox\') })"></a><div class="details"><div title="Follow" class="follow_star no_select login_required icon_not_following" data-slug="bashful_brunette"></div><div class="title"><a target="_blank" href="/blondefoxsilverfox/" data-room="blondefoxsilverfox" style="cursor: pointer;"> blondefoxsilverfox</a><div class="age_gender_container"><span class="age">99</span><span class="genderc" title="Couple"></span></div></div><ul class="subject"><li title="Girl Top off at goal!">girl top off at goal!</li></ul><ul class="sub-info"><li class="location">United States</li><li class="cams"><span class="time">24 mins</span><span class="comma">, </span><span class="viewers">3464 viewers</span></li></ul></div><div style="top: 2px; left: 2px; position: absolute; cursor: pointer;"><div name="blondefoxsilverfox">⛔</div></div></li>');

function generalStuff() {
  globals.http = new XMLHttpRequest()

  let terms = document.querySelector('#close_entrance_terms')
  if (terms) terms.click() // just accept terms

  addTabs()
  cleanPage()

  globals.camsPath = '/cams-cbplus/'
  globals.blackPath = '/cams-blacklist/'
  globals.toursPath = '/tours/3/'
  globals.json_path_root_old = 'https://chaturbate.com/api/public/affiliates/onlinerooms/?wm=HNwJw&format=json&region=northamerica&client_ip=67.60.87.179&limit=200&gender=f&gender=c';
  globals.json_path_root = 'https://chaturbate.com/api/public/affiliates/onlinerooms/?wm=HNwJw&format=json&client_ip=67.60.87.179&limit=200';
  globals.follow_path = 'https://chaturbate.com/followed-cams/online/';
  globals.path = document.location.pathname
  globals.models = [];
  globals.filters = {
        "gender": ["f","c"],
        "region": ["northamerica"],
    };
  globals.frame = null;
  //console.log(globals.path);
  if (globals.path == globals.camsPath){
      camsSite()
  }else if (globals.path == globals.blackPath){
      blackSite()
  }else if (globals.path == globals.toursPath){
      toursPage()
  }

}

function toggleFilter(key, val){
    if(globals.filters[key].includes(val)){
        //Remove Filter
        let index = globals.filters[key].indexOf(val);
        let x = globals.filters[key].splice(index, 1);
    }else{
        //Add Filter
        globals.filters[key].push(val);
    }
    checkForFollowed();
}

function camsSite() {

  let newVersion = true;

  const playerID = makeid(32)
  globals.playerID = playerID;
  globals.chat = new BroadcastChannel(playerID)

  document.title = 'CBPlus Cams'
  let head = document.getElementById("header")
  $("#base").html("");
  //document.body.innerHTML = "";
  document.body.style.height = '100vh'
  document.body.style.display = 'flex'
  document.body.style.flexDirection = 'column'
  document.body.appendChild(head)

  const body_main = document.createElement('div')
  body_main.style.display = 'flex'
  body_main.style.flexDirection = 'row'
  body_main.style.flex = '1'

  const main = document.createElement('div')
  main.setAttribute("id", "mainDiv")
  main.style.boxSizing = 'border-box'
  main.style.flex = '1'
  main.style.display = 'grid'
  main.className = 'oneCam'
  main.appendChild(camDiv())

  let rightMenu = document.createElement("div")
  rightMenu.setAttribute("id", "rightMenu")
  rightMenu.style.top = "0"
  rightMenu.style.bottom = "0"
  rightMenu.style.right = "0"
  rightMenu.style.width = "600px"
  //rightMenu.style.display = 'flex'
  //rightMenu.style.display = 'block'
  rightMenu.style.position = 'relative'
  rightMenu.style.overflow = 'auto'
  //rightMenu.style.flexDirection = 'column'
  let filter_element = document.createElement("div");
  filter_element.setAttribute("id", "filter_menu")
    filter_element.innerHTML = "<input class='filter_check' type='checkbox' data-filter='gender' value='f' checked/> Female  &nbsp;&nbsp;&nbsp;<input class='filter_check' type='checkbox' data-filter='gender' value='m' /> Male   &nbsp;&nbsp;&nbsp;<input class='filter_check' type='checkbox' data-filter='gender' value='c' checked /> Couple    &nbsp;&nbsp;&nbsp;<input class='filter_check' type='checkbox' data-filter='gender' value='s' /> Trans";
  filter_element.style.padding = "10px"
  rightMenu.appendChild(filter_element)



  let frame = document.createElement("iframe")
  frame.src = 'https://chaturbate.com/tours/3/?p=0&c=1&playerID='+playerID
  frame.style.flex = '1'
  frame.style.border = '0'
  frame.style.width = "600px"

  let hideMenu = document.createElement("li");
  hideMenu.innerHTML = `<a style="color: gold;">        HIDE/SHOW LIST</a>`;
  hideMenu.style.cursor = 'pointer'
  hideMenu.onclick = function () { $('div#rightMenu').toggle(1000) }
  document.getElementById("nav").appendChild(hideMenu);

  let frame2 = $('<div align="center" style="clear:both; margin: 10px auto; position:absolute;"></div>');

  frame2 = frame2[0];//convert to HTML Element
  let frame3 = document.createElement("ul");
  frame3.setAttribute("id", "card_holder");
  frame3.setAttribute("class", "list tour_list");
  frame3.style.marginLeft = '10px'
   if(newVersion){
       globals.frame = frame2;
   }else{
       globals.frame = frame;
   }
  frame2.appendChild(frame3)
  rightMenu.appendChild(globals.frame)
  body_main.appendChild(main)
  body_main.appendChild(rightMenu)
  document.body.appendChild(body_main)
   if(newVersion){
       checkForFollowed();
       //myInterval = setInterval(checkForFollowed, 10000);
   }

  $('div#mainDiv').sortable({
    tolerance: "pointer",
    revert: true,
    cancel: ".vjs-volume-control",
    stop: function (event, ui) { Dropped(event, ui) }
  })
   bindEvents();
  globals.chat.onmessage = readMessage
}

function bindEvents(){
    $(".filter_check").each(function(){
        this.onchange = function() {
            toggleFilter(this.dataset.filter, this.value);
        }
    });
}

function checkForFollowed(){
    $.ajax({url: globals.follow_path, success: function(result){
        let follower_holder = $(result);
        globals.items = [];
        globals.models = [];
        follower_holder.find("li.roomCard").each(function(){
            $(this).find("div.title a").each(function(){
                $(this).css("color","#f79603");
                globals.models.push($(this).attr("data-room"));
            });
            $(this).css("borderColor","#f79603");
            globals.items.push($(this));
        });
        populateFrame();
    }});
}


function applyToTemplate(holder, val){
    let new_template = globals.template.clone()
            new_template.find("div.title a").each(function(){
                this.setAttribute("href", "/" + val.username + "/");
                this.innerHTML = val.username;
            });
            new_template.find("div.follow_star").each(function(){
                this.setAttribute("data-slug", val.username);
                //t.setFollowUnfollowStar(e);
                //setFollowUnfollowStar(val.username);
            });

            new_template.find("img.room_thumbnail").each(function(){
                this.setAttribute("src", val.image_url);
            });
            new_template.find("ul.subject li").each(function(){
                this.setAttribute("title", val.room_subject);
                this.innerHTML = val.room_subject;
            });
            new_template.find("span.age").each(function(){
                this.innerHTML = val.age;
            });
            new_template.find("span.viewers").each(function(){
                this.innerHTML = val.num_users + " viewers";
            });
            new_template.find("span.genderc").each(function(){
                if(val.gender == "t"){val.gender = "s";}
                this.setAttribute("class", "gender" + val.gender);
            });
            new_template.find("span.time").each(function(){
                let minutes = Math.floor(val.seconds_online/60);
                this.innerHTML = minutes + " minutes";
            });
            //room_subject
            new_template.appendTo(holder);
}

function pullDataFromFollowed(followed_element){
    globals.follow_path
    followed_element_html = followed_element.html();
    let followed_object = {};
    followed_object.username = followed_element.find(".roomElementAnchor").attr("data-room");
    followed_object.image_url = followed_element.find(".room_thumbnail").attr("src");
    followed_object.age = "N/A";
    followed_object.num_users = "N/A";
    followed_object.gender = "N/A";
    followed_object.seconds_online = 60;
    followed_object.room_subject = "Following";

    return followed_object;
}

function populateFrame(){
    let filter_params = "";
    $.each(globals.filters, function(key, val){
        for (let i = 0; i < val.length; i++) {
            filter_params = filter_params + "&" + key + "=" + val[i];
        }
    });
    //globals.json_path_root
    $.getJSON( globals.json_path_root + filter_params, function( data ) {
        let holder = $(globals.frame).find("#card_holder");
        holder.html("");
        for (let i = 0; i < globals.items.length; i++) {
            globals.items[i].appendTo(holder);
        }
        $.each( data.results, function( key, val ) {
            if(!globals.models.includes(val['username'])){
                applyToTemplate(holder, val);
            }
        });
        toursPageNew()
    });
}

function Dropped(event, ui) {
  let player = ui.item[0].querySelector('video')
  if (player) player.play()
}

function blackSite() {
  document.title = 'CBPlus Blacklist'
  let mainD = document.getElementById("main");
  let body = mainD.getElementsByClassName("content_body")[0];
  let ul = document.createElement("ul");

  let len = localStorage.length
  let keys = Object.keys(localStorage)
  for (var i=0; i<len; i++) {
    if (!keys[i].includes('cbplus_blacklist_')) continue
    let li = document.createElement("li");
    let title = keys[i].substring(17)
    li.innerHTML = title + ", " + localStorage.getItem(keys[i]);
    li.onclick = function() {
      if (confirm('Are you sure you want to delete ' + this.innerHTML.split(",")[0] + ' from blacklist?')) {
        localStorage.removeItem('cbplus_blacklist_' + this.innerHTML.split(",")[0]);
        //console.log(this.innerHTML + " is not longer on BLACKLIST");
        this.remove();
      } else {
        // Do nothing!
      }
    };
    li.style.cursor = 'pointer';
    li.onmouseover = function() {
      this.style.textDecoration = "line-through";
    };
    li.onmouseout = function() {
      this.style.textDecoration = "none";
    };
    ul.appendChild(li);
  }

  body.innerHTML = "";
  body.appendChild(ul);
}

function toursPage() {
  document.body.style.padding = '0 8px'
  addMiniButtons()
  //setTimeout(function(){ window.location.reload(1); }, 60000);
  let playerID = document.location.search;
  playerID = playerID.substring(playerID.indexOf("playerID")).split("&")[0].split("=")[1]
    console.log(playerID);
  globals.chat = new BroadcastChannel(playerID)
}

function toursPageNew() {
  document.body.style.padding = '0 8px'
  addMiniButtonsNew()
  //setTimeout(function(){ window.location.reload(1); }, 60000);
  let playerID = globals.playerID;
  //playerID = playerID.substring(playerID.indexOf("playerID")).split("&")[0].split("=")[1]
  globals.chat = new BroadcastChannel(playerID)
}

function readMessage(msg) {
  let cmd = msg.data.split(" ")
  let check = document.body.querySelectorAll("div#mainDiv > div[name=\""+cmd[1]+"\"]")
  let wins = document.querySelectorAll("div#mainDiv > div.free")
  if (wins.length == 0 && !check.length) wins = addCamPlace()
  if (cmd[0] == "watch" && cmd[1].length > 0 && wins.length > 0 && !check.length) {
    globals.http.open('GET', `https://chaturbate.com/${cmd[1]}`, true)
    globals.http.setRequestHeader("Content-type","application/x-www-form-urlencoded")
    globals.http.onload = function() { addCam(globals.http.responseText, wins[0], cmd[1]) }
    globals.http.send()
  } else if (check.length) { console.log("already watching "+cmd[1]+"!") }
  else {
    //console.log("no free spots left!")
  }
}

function urlToName(input) {
  var output = input.substring(1);
  output = output.substring(0, output.search("/"));
  return output;
}

function cleanPage() {
  var Element = document.createElement("div");

  var ads = document.getElementsByClassName("remove_ads");
  if (ads.length > 0) ads[0].parentNode.remove();
  ads = document.getElementsByClassName("ad");
  if (ads.length > 0) ads[0].remove();

  var logo = document.getElementsByClassName("logo-zone");
  //if (logo.length > 0) logo[0].parentNode.remove();

  Element.style.padding = "10px 0";
  var content = document.getElementsByClassName("content");
  if (content.length > 0) if (content[0].style.padding != Element.style.padding) content[0].style.padding = Element.style.padding;

  Element.style.margin = "0 5px";
  var c1Main = document.getElementsByClassName('c-1 endless_page_template');
  if (c1Main.length > 0) if (c1Main[0].style.margin != Element.style.margin) c1Main[0].style.margin = Element.style.margin;

  var c1 = document.getElementsByClassName("c-1");
  if (c1.length > 0) if (c1[0].style.margin != Element.style.margin) c1[0].style.margin = Element.style.margin;

  var blogPosts = document.getElementsByClassName('c-1 featured_blog_posts');
  if (blogPosts.length > 0) blogPosts[0].remove();
}

function addCamPlace() {
  let main = document.querySelector('div#mainDiv')
  let len = main.querySelectorAll('div.cam').length
  let loops = 0

  let mainClass = 'Cams35'
  if (len == 1) { loops = 1; mainClass = 'Cams2'}
  else if (len == 2) { loops = 1; mainClass = 'Cams3' }
  else if (len == 3) { loops = 1; mainClass = 'Cams4' }
  else if (len == 4) { loops = 1; mainClass = 'Cams5' }
  else if (len == 5) { loops = 1; mainClass = 'Cams6' }
  else if (len == 6) { loops = 3; mainClass = 'Cams9' }
  else if (len == 9) { loops = 3; mainClass = 'Cams12' }
  else if (len == 12) { loops = 4; mainClass = 'Cams16' }
  else if (len == 16) { loops = 4; mainClass = 'Cams20' }
  else if (len == 20) { loops = 5; mainClass = 'Cams25' }
  else if (len == 25) { loops = 5; mainClass = 'Cams30' }
  else if (len == 30) { loops = 5; mainClass = 'Cams35' }

  for (let i =0; i < loops; i++) main.appendChild(camDiv())

  main.className = mainClass
  return main.querySelectorAll("div.free")
}

function cleanCams() {
  let main = document.querySelector('div#mainDiv')
  let cams = main.querySelectorAll("div.free")
  let loops = 0

  for (let i =0; i < cams.length; i++) main.removeChild(cams[i])

  let len = main.querySelectorAll('div.cam').length

  let mainClass = 'oneCam'
  if (len > 30) { loops = 35-len; mainClass = 'Cams35' }
  else if (len > 25) { loops = 33-len; mainClass = 'Cams30' }
  else if (len > 20) { loops = 25-len; mainClass = 'Cams25' }
  else if (len > 16) { loops = 20-len; mainClass = 'Cams20' }
  else if (len > 12) { loops = 16-len; mainClass = 'Cams16' }
  else if (len > 9) { loops = 12-len; mainClass = 'Cams12' }
  else if (len > 6) { loops = 9-len; mainClass = 'Cams9' }
  else if (len > 5) { loops = 6-len; mainClass = 'Cams6' }
  else if (len > 4) { loops = 5-len; mainClass = 'Cams5' }
  else if (len > 3) { loops = 4-len; mainClass = 'Cams4' }
  else if (len > 2) { loops = 3-len; mainClass = 'Cams3' }
  else if (len > 1) { loops = 2-len; mainClass = 'Cams2' }
  else if (!len) { loops = 1 }

  for (let i =0; i < loops; i++) main.appendChild(camDiv())
  main.className = mainClass
}

function camDiv() {
  let c = document.createElement('div')
  c.classList = 'cam ui-sortable-handle free'
  c.appendChild(plusButton())
  return c
}

function addMiniButtons() {
  let rooms = document.querySelectorAll('ul.list > li')
  if (!rooms.length) return false

  for (let i=0; i < rooms.length; i++) {
    let name = rooms[i].querySelector('a').getAttribute('href').slice(1,-1)
    if (localStorage.getItem(`cbplus_blacklist_${name}`) != undefined) {
      rooms[i].style.display = "none"
      continue
    }
    let tmpLink = rooms[i].querySelector('div.title a')
    let tmpName = rooms[i].querySelector('div.title a').getAttribute("href").slice(1,-1)
    rooms[i].querySelector('a').removeAttribute("href")
    rooms[i].style.cursor = 'pointer'
    rooms[i].querySelector('a').setAttribute("name", tmpName)
    rooms[i].querySelector('a').onclick = function () { globals.chat.postMessage(`watch ${this.getAttribute("name")}`) }
    tmpLink.setAttribute('target', '_blank')
    tmpLink.style.cursor = 'pointer'
    let buttons = document.createElement('div')
    buttons.style.top = '2px'
    buttons.style.left = '2px'
    buttons.style.position = 'absolute'
    buttons.style.cursor = 'pointer'

    let blockButton = document.createElement('div')
    blockButton.innerHTML = '⛔'
    blockButton.setAttribute("name", tmpName)
    blockButton.onclick = function () {
      let cam = this.parentNode.parentNode
      let name = this.getAttribute("name")
      if (confirm('Are you sure you want to add ' + name + ' to blacklist?')) {
        let gender = cam.querySelector('div.title span').className.substr(-1)
        let age = cam.querySelector('div.title span').innerHTML;
        let value = gender + " " + age + " added: " + new Date().toLocaleString();
        cam.style.display = "none";
        localStorage.setItem(`cbplus_blacklist_${name}`, value);
      }
    }
    buttons.appendChild(blockButton)

    let gender = rooms[i].querySelector('div.title span').className.substr(-1)
    //if (gender == 'm' || gender == 's') rooms[i].style.display = "none";
    //else
    rooms[i].appendChild(buttons);
  }
}

function addMiniButtonsNew() {
  let rooms = document.querySelectorAll('ul.list > li')
  if (!rooms.length) return false
  for (let i=0; i < rooms.length; i++) {
    let name = rooms[i].querySelector('a').getAttribute('href').slice(1,-1)
    if (localStorage.getItem(`cbplus_blacklist_${name}`) != undefined) {
      rooms[i].style.display = "none"
      continue
    }
    let tmpLink = rooms[i].querySelector('div.title a')
    let tmpName = rooms[i].querySelector('div.title a').getAttribute("href").slice(1,-1)
    rooms[i].querySelector('a').removeAttribute("href")
    rooms[i].style.cursor = 'pointer'
    rooms[i].querySelector('a').setAttribute("name", tmpName)
    rooms[i].querySelector('a').onclick = function () {
        globals.chat.postMessage(`watch ${this.getAttribute("name")}`)
    }
    tmpLink.setAttribute('target', '_blank')
    tmpLink.style.cursor = 'pointer'
    let buttons = document.createElement('div')
    buttons.style.top = '2px'
    buttons.style.left = '2px'
    buttons.style.position = 'absolute'
    buttons.style.cursor = 'pointer'

    let blockButton = document.createElement('div')
    blockButton.innerHTML = '⛔'
    blockButton.setAttribute("name", tmpName)
    blockButton.onclick = function () {
      let cam = this.parentNode.parentNode
      let name = this.getAttribute("name")
      if (confirm('Are you sure you want to add ' + name + ' to blacklist?')) {
        let gender = cam.querySelector('div.title span').className.substr(-1)
        let age = cam.querySelector('div.title span').innerHTML;
        let value = gender + " " + age + " added: " + new Date().toLocaleString();
        cam.style.display = "none";
        localStorage.setItem(`cbplus_blacklist_${name}`, value);
      }
    }
    buttons.appendChild(blockButton)

    let gender = rooms[i].querySelector('div.title span').className.substr(-1)
    //if (gender == 'm' || gender == 's') rooms[i].style.display = "none";
    //else
    rooms[i].appendChild(buttons);
  }
}

function addTabs() {
  var sub_nav = document.getElementById("nav");
  if (sub_nav) {
    document.querySelector("div.nav-bar").style.height = "auto"
    // cams Tab
    var camsTab = document.createElement("li");
    camsTab.innerHTML = `<a style="color: gold;" href=\"/cams-cbplus/\">CBPLUS</a>`;
    sub_nav.appendChild(camsTab);
    // blacklist Tab
    let blackTab = document.createElement("li");
    blackTab.innerHTML = `<a href=\"/cams-blacklist/\">BLACKLIST</a>`;
    sub_nav.appendChild(blackTab);
  }
}

function makeid(length) {
   var result = '';
   var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

function addCam(resp, div, model) {
  let pos1 = resp.search('https://edge')
  let pos2 = resp.search('.m3u8')+5
  let stream = ''
  if (resp.includes('.m3u8')) { stream = resp.substring(pos1, pos2).replace(/\\u002D/g, '-') }
  else { stream = 'no data' }
  let poster = 'https://cbjpeg.stream.highwebmedia.com/stream?room='+model+'&f='+Math.random()
  let id = 'cam'+Math.floor(Math.random()*10000)
  div.classList.remove('free')
  div.setAttribute("name", model)
  div.innerHTML = `<video style="width: 100%; height: 100%;" id="${id}" class="video-js" poster="${poster}">
                   <source src="${stream}" type=""application/x-mpegURL""></source></video>`
  div.appendChild(topButtons(model))
  const player = videojs(id, { controls: true, autoplay: true, preload: 'auto', fluid: false, enableLowInitialPlaylist: true })
  player.volume(0.5)
}

function openInTab(div){
    let model_name = div.getAttribute("name")
    let URL = `https://chaturbate.com/${model_name}`;
    window.open(URL, '_blank');
}

function refreshCam(div) {
  div.innerHTML = ''
  div.classList.add('free')
  console.dir(div)
  let model_name = div.getAttribute("name")
  div.removeAttribute("name")
  globals.http.open('GET', `https://chaturbate.com/${model_name}`, true)
  globals.http.setRequestHeader("Content-type","application/x-www-form-urlencoded")
  globals.http.onload = function() { addCam(globals.http.responseText, div, model_name) }
  globals.http.send()
}

function removeCam(div) {
  div.innerHTML = ''
  div.classList.add('free')
  div.removeAttribute("name")
  div.appendChild(plusButton())
  cleanCams()
}

function plusButton() {
  let b = document.createElement('button')
  b.innerHTML = 'ADD'
  b.classList.add('plusButton')
  b.addEventListener('click', e => {
      e.preventDefault()
      let user_data = prompt(`Enter cb model name:`, '')
      if (user_data !== null) {
        user_data = user_data.trim()
        if (user_data.includes('/') || user_data.includes('chaturbate.com')) {
          user_data = user_data.split('/').filter(Boolean).pop()
        }
        globals.http.open('GET', `https://chaturbate.com/${user_data}`, true)
        globals.http.setRequestHeader("Content-type","application/x-www-form-urlencoded")
        globals.http.onload = function() { addCam(globals.http.responseText, e.composedPath()[1], user_data) }
        globals.http.send()
      }
    })
  return b
}

function topButtons(name) {
  let top = document.createElement('div')
  top.classList.add('topFrame')

  let n = document.createElement('button')
  n.innerHTML = name+' '
  n.classList.add('topButton')
   n.style.color = "#ffffff"
  let r = document.createElement('button')
  r.innerHTML = '🔄'
  r.classList.add('topButton')
  let x = document.createElement('button')
  x.innerHTML = '❌'
  x.classList.add('topButton')
  top.appendChild(n)
  top.appendChild(r)
  n.addEventListener('click', e => {
    e.preventDefault()
    openInTab(e.composedPath()[2])
  })
  r.addEventListener('click', e => {
    e.preventDefault()
    refreshCam(e.composedPath()[2])
  })
  top.appendChild(x)
  x.addEventListener('click', e => {
    e.preventDefault()
    removeCam(e.composedPath()[2])
  })
  return top
}

generalStuff()
