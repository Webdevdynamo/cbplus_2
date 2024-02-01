// ==UserScript==
// @name         cbplus2.0
// @namespace    https://github.com/Webdevdynamo/
// @downloadURL  https://raw.githubusercontent.com/Webdevdynamo/cbplus_2/main/index.js
// @updateURL  https://raw.githubusercontent.com/Webdevdynamo/cbplus_2/main/index.js
// @version      2.3.5
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
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// ==/UserScript==

'use strict';


GM_addStyle (GM_getResourceText("vjCSS"));
GM_addStyle (GM_getResourceText("jqCSS"));
GM_addStyle (GM_getResourceText("cbCSS"));

const globals = {};

globals.template = $('<li class="room_list_room roomCard" style="cursor: pointer;"><a href="/blondefoxsilverfox/" target="_blank" data-room="blondefoxsilverfox" class="no_select"><img src="https://roomimg.stream.highwebmedia.com/riw/blondefoxsilverfox.jpg?1688693700" width="180" height="101" alt="blondefoxsilverfox\'s chat room" class="png room_thumbnail" onmouseenter="window[\'tsExec\'] &amp;&amp; tsExec(function(ts){ event &amp;&amp; ts.roomReload.startStreaming(\'blondefoxsilverfox\', event.currentTarget) })" onmouseleave="window[\'tsExec\'] &amp;&amp; tsExec(function(ts){ ts.roomReload.stopStreaming(\'blondefoxsilverfox\') })"></a><div class="details"><div class="title"><a target="_blank" href="/blondefoxsilverfox/" data-room="blondefoxsilverfox" style="cursor: pointer;"> blondefoxsilverfox</a><div class="age_gender_container"><span class="age">99</span><span class="genderc" title="Couple"></span></div></div><ul class="subject"><li title="Girl Top off at goal!">girl top off at goal!</li></ul><ul class="sub-info"><li class="location">United States</li><li class="cams"><span class="time">24 mins</span><span class="comma">, </span><span class="viewers">3464 viewers</span></li></ul></div><div style="top: 2px; left: 2px; position: absolute; cursor: pointer;"><div name="blondefoxsilverfox">⛔</div></div></li>');


function generalStuff() {
  //console.log(unsafeWindow);
  //getIP();
  let terms = document.querySelector('#close_entrance_terms')
  if (terms) terms.click() // just accept terms

  addTabs()
  cleanPage()

  let open_rooms = GM_getValue("open_rooms");
  if(typeof open_rooms == "undefined"){
    globals.open_rooms = [];
  }else{
    globals.open_rooms = JSON.parse(open_rooms);
  }
  globals.camsPath = '/cams-cbplus/'
  globals.blackPath = '/cams-blacklist/'
  globals.toursPath = '/tours/3/'
  globals.json_path_root_old = 'https://chaturbate.com/api/public/affiliates/onlinerooms/?wm=HNwJw&format=json&region=northamerica&client_ip=67.60.87.179&limit=500&gender=f&gender=c';
  globals.json_path_root = 'https://chaturbate.com/api/public/affiliates/onlinerooms/?wm=HNwJw&format=json&client_ip=67.60.87.179&limit=500';
  //globals.follow_path = 'https://chaturbate.com/followed-cams/online/';
  globals.follow_path = 'https://chaturbate.com/api/ts/roomlist/room-list/?enable_recommendations=false&follow=true&limit=90&offline=false&offset=0&regions=NA';
  globals.path = document.location.pathname
  globals.models = [];
  globals.models_online = {};
  globals.models_list = [];
  globals.videoInterval = null;
  globals.current_chat = null;
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
      toursPageNew()
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
    getXMLModelList();
}

function camsSite() {

  let newVersion = true;

  const playerID = makeid(32)
  globals.playerID = playerID;
  globals.chat = new BroadcastChannel(playerID)

  document.title = 'CBPlus Cams'
  let head = document.getElementById("header")
  //section
  $("#base").html("");
  //document.body.innerHTML = "";
  document.body.style.height = '100vh'
  document.body.style.display = 'flex'
  document.body.style.padding = '0px 0px'
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
  main.appendChild(camDiv("empty"))

  let rightMenu = document.createElement("div")
  rightMenu.setAttribute("id", "rightMenu")
  rightMenu.style.top = "0"
  rightMenu.style.bottom = "0"
  rightMenu.style.right = "0"
  rightMenu.style.width = "100%"
  rightMenu.style.height = "calc(100% - 100px)"
  //rightMenu.style.display = 'flex'
  //rightMenu.style.display = 'block'
  rightMenu.style.position = 'relative'
  rightMenu.style.overflow = 'auto'
  //rightMenu.style.flexDirection = 'column'
  let filter_element_holder = document.createElement("div");
  filter_element_holder.style.position = "relative";
  filter_element_holder.style.zIndex = "1";
  filter_element_holder.style.width = "100%";
  filter_element_holder.style.height = "100px";
  //filter_element.style.padding = "10px"

  let filter_element = document.createElement("div");
  //filter_element.style.padding = "10px";
  filter_element.style.borderBottom = "1px solid #f47321";
  filter_element.style.height = "100%";
  filter_element.setAttribute("id", "filter_menu")
    filter_element.innerHTML = "<div id='filter_holder'><input class='filter_check' type='checkbox' data-filter='gender' value='f' checked/> Female  &nbsp;&nbsp;&nbsp;<input class='filter_check' type='checkbox' data-filter='gender' value='m' /> Male   &nbsp;&nbsp;&nbsp;<input class='filter_check' type='checkbox' data-filter='gender' value='c' checked /> Couple    &nbsp;&nbsp;&nbsp;<input class='filter_check' type='checkbox' data-filter='gender' value='s' /> Trans</div>";
  filter_element_holder.appendChild(filter_element)



  let frame = document.createElement("iframe")
  frame.src = 'https://chaturbate.com/tours/3/?p=0&c=1&playerID='+playerID
  frame.style.flex = '1'
  frame.style.border = '0'
  frame.style.width = "600px"

  let hideMenu = document.createElement("li");
  hideMenu.innerHTML = `<a style="color: gold;">        HIDE/SHOW LIST</a>`;
  hideMenu.style.cursor = 'pointer'
  hideMenu.onclick = function () {
      hideMenus();
  }


  let hideChat = document.createElement("li");
  hideChat.innerHTML = `<a style="color: gold;">        HIDE/SHOW CHAT</a>`;
  hideChat.style.cursor = 'pointer'
  hideChat.onclick = function () {
      hideChatColumn();
  }

  document.getElementById("nav").appendChild(hideMenu);
  document.getElementById("nav").appendChild(hideChat);

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

  let rightMenuHolder = document.createElement("div")
  rightMenuHolder.setAttribute("id", "rightMenuHolder");
  rightMenuHolder.style.position = "relative";
  rightMenuHolder.style.width = "405px";

  let chatParent = document.createElement("div")
  chatParent.setAttribute("id", "chatParent");
  chatParent.style.position = "relative";


  let chatLabel = document.createElement("div")
  chatLabel.setAttribute("id", "chatLabel");
  chatLabel.innerHTML = "CHAT LABEL";
  // chatLabel.style.height = "50px";
  // chatLabel.style.position = "absolute";
  // chatLabel.style.backgroundColor = "red";
  // chatLabel.style.top = "0px";


  let chatLoader = document.createElement("div")
  chatLoader.setAttribute("id", "chatLoader");
  chatLoader.style.width = "100%";
  chatLoader.style.height = "100%";
  chatLoader.style.position = "absolute";
  chatLoader.style.color = "#fff";
  chatLoader.style.backgroundColor = "#f47321";
  chatLoader.style.top = "0px";
  chatLoader.appendChild(chatLabel)

  let chatHolder = document.createElement("div")
  chatHolder.setAttribute("id", "chatHolder");
  chatHolder.style.width = "300px";
  chatHolder.style.height = "100%";
  chatParent.appendChild(chatHolder)
  chatParent.appendChild(chatLoader)
  frame2.appendChild(chatParent)

  frame2.appendChild(frame3)
  rightMenu.appendChild(globals.frame)
  body_main.appendChild(main)
  body_main.appendChild(chatParent)
  body_main.appendChild(rightMenuHolder)
  rightMenuHolder.appendChild(filter_element_holder)
  rightMenuHolder.appendChild(rightMenu)
  document.body.appendChild(body_main)

  unloadChat();
   if(newVersion){
        getXMLModelList();
       let myInterval = setInterval(getXMLModelList, 10000);
   }

  $('div#mainDiv').sortable({
    tolerance: "pointer",
    revert: true,
    cancel: ".vjs-volume-control, .topFrame",
    stop: function (event, ui) { Dropped(event, ui) }
  })
   bindEvents();
   hideHeader();

   globals.chat.onmessage = readMessage;
   setTimeout(function(){ openExistingCams();}, 1000);
   //openExistingCams();
}

function openExistingCams(){
  console.log("Existing Cams",globals.open_rooms);
  for (var i=0; i<globals.open_rooms.length; i++) {
    globals.chat.postMessage('watch ' + globals.open_rooms[i]);
  }
}

function hideHeader(){
  var user_info = $("#user_information").detach();
  user_info.prependTo($("#filter_menu"));
  user_info
  .css("margin", "0px")
  .css("line-height", "normal");
  $("#header .section").toggle(1000);
}

function hideMenus(){
  //$("#header .section").toggle(1000)
  $('div#rightMenuHolder').toggle(1000)
}

function hideChatColumn(){
  $('#chatParent').toggle(500)
}

function bindEvents(){
    $(".filter_check").each(function(){
        this.onchange = function() {
            toggleFilter(this.dataset.filter, this.value);
        }
    });
}

function getXMLModelList(){
  globals.models_online = {};
  globals.models_list = [];
  let filter_params = "";
  $.each(globals.filters, function(key, val){
      for (let i = 0; i < val.length; i++) {
          filter_params = filter_params + "&" + key + "=" + val[i];
      }
  });
  //globals.json_path_root
  let url = globals.json_path_root + filter_params;
   //checkForFollowed()

        globals.items = [];
        globals.models = [];
    $.ajax({url: globals.follow_path, success: function(result){
        $.each( result.rooms, function( key, val ) {
            globals.models_online[val['username']] = val;
            globals.models_list.push(val);
        });
      //console.log(globals.models_list);
    console.log("Fetching List:", url);
    $.getJSON( url, function( data ) {
        $.each( data.results, function( key, val ) {
            //console.log(val['username']);
            if(typeof globals.models_online[val['username']] == "undefined"){
                globals.models_online[val['username']] = val;
                globals.models_list.push(val);
            }
        });
      //console.log(globals.models_list);
    //checkForFollowed()
        populateFrame();
  });
    }});
}

function checkForFollowed(){
    //console.log("ONLINE MODELS", globals.models_online);
    $.ajax({url: globals.follow_path, success: function(result){
        //let follower_holder = $(result);
        console.log(result);

        $.each( result.rooms, function( key, val ) {
        //follower_holder.find("li.roomCard").each(function(){
                console.log(val);
            //$(this).find("div.title a").each(function(){
                $(this).css("color","#f79603");
                //let model_name = $(this).attr("data-room");
                let model_name = val.room;
            console.log(model_name);
                globals.models.push(model_name);
                if(typeof globals.models_online[model_name] != "undefined"){
                    let cam_state = globals.models_online[model_name].current_show;
                    let is_new = globals.models_online[model_name].is_new;
                    if(is_new){
                        let private = $('<div class="thumbnail_label thumbnail_label_c_new">NEW</div>');
                        private.appendTo($(this));
                    }
                    if(cam_state == "private"){
                        let private = $('<div class="thumbnail_label_featured thumbnail_label_c_private_show">IN PRIVATE</div>');
                        private.appendTo($(this));
                    }
                    if(cam_state == "hidden"){
                        let private = $('<div class="thumbnail_label_featured thumbnail_label_c_private_show">IN TICKET SHOW</div>');
                        private.appendTo($(this));
                    }
                }
            //});
            $(this).find("div.follow_star").each(function(){
              $(this).remove();
            });
            $(this).css("borderColor","#f79603");
            globals.items.push($(this));
        });
        populateFrame();
    }});
}


function applyToTemplate(holder, val){
    val.followed = false;
    if(val.img){
        val.followed = true;
        val.image_url = val.img;
    }
    if(val.subject){
        val.room_subject = val.subject;
    }
    if(val.display_age){
        val.age = val.display_age;
    }
    let new_template = globals.template.clone()
            new_template.find("div.title a").each(function(){
                if(val.followed){
                    this.style.color = "#f79603";
                }
                this.setAttribute("href", "/" + val.username + "/");
                this.innerHTML = val.username;
            });
            new_template.find("div.follow_star").each(function(){
              $(this).remove();
                //this.setAttribute("data-slug", val.username);
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
                if(!val.age){
                    val.age = "";
                }
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
                if(val.seconds_online){
                    let minutes = Math.floor(val.seconds_online/60);
                    this.innerHTML = minutes + " minutes";

                }else{
                    this.innerHTML = "N/A";
                }
            });
            if(val.is_new){
              let private = $('<div class="thumbnail_label thumbnail_label_c_new">NEW</div>');
              new_template.find("div.title a").each(function(){
                private.appendTo($(this));
              })
            }
            if(val.current_show == "private"){
              let private = $('<div class="thumbnail_label_featured thumbnail_label_c_private_show">IN PRIVATE</div>');
              new_template.find("div.title a").each(function(){
                private.appendTo($(this));
              })
            }
            if(val.current_show == "hidden"){
              let private = $('<div class="thumbnail_label_featured thumbnail_label_c_private_show">IN TICKET SHOW</div>');
              new_template.find("div.title a").each(function(){
                private.appendTo($(this));
              })
            }
            //<div class="thumbnail_label_featured thumbnail_label_c_private_show">IN PRIVATE</div>
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

function populateFrame_old(){
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
            globals.models_online[val['username']] = val;
            if(!globals.models.includes(val['username'])){
                applyToTemplate(holder, val);
            }
        });
        toursPageNew()
    });
}

function populateFrame(){
    let holder = $(globals.frame).find("#card_holder");
    holder.html("");
    for (let i = 0; i < globals.items.length; i++) {
        globals.items[i].appendTo(holder);
    }
    $.each( globals.models_list, function( key, val ) {
        globals.models_online[val['username']] = val;
        if(!globals.models.includes(val['username'])){
            applyToTemplate(holder, val);
        }
    });
    toursPageNew()
}


function Dropped(event, ui) {
  let player = ui.item[0].querySelector('video')
  if (player){
    player.play();
    reOrderCams();
  }
}

function unloadChat(){
  $("#chatLabel").html("Choose a model");
  $("#chatLoader").animate({height:"100%"},200);
  $("#chatHolder").html("");
}

function changeToMainWindowChat(){
  let i = 0;
  //console.log("OPEN ROOMS", globals.open_rooms);
  $("#mainDiv").children().each(function(){
    let model_name = $(this).attr("id");
    //console.log("NEW CHAT", model_name);
    if(typeof model_name == "undefined"){
      unloadChat();
      return false;
    }else if(model_name == "empty"){
      unloadChat();
      return false;
    }
      if(i<1){
          getChatPage(model_name);
      }
      i++;
  });
}

function reOrderCams(){
  globals.open_rooms = [];
    let i = 0;
  $("#mainDiv").children().each(function(){
    let model_name = $(this).attr("id");
      globals.open_rooms.push(model_name);
      i++;
  });
  updateCamStorage();
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
  document.body.style.padding = '0 0'
  addMiniButtons()
  //setTimeout(function(){ window.location.reload(1); }, 60000);
  let playerID = document.location.search;
  playerID = playerID.substring(playerID.indexOf("playerID")).split("&")[0].split("=")[1]
    console.log(playerID);
  globals.chat = new BroadcastChannel(playerID)
}

function toursPageNew() {
  document.body.style.padding = '0 0'
  addMiniButtonsNew()
  //setTimeout(function(){ window.location.reload(1); }, 60000);
  let playerID = globals.playerID;
  //playerID = playerID.substring(playerID.indexOf("playerID")).split("&")[0].split("=")[1]
  globals.chat = new BroadcastChannel(playerID)
}

function checkIfModelOnline(model_name){
  if(typeof globals.models_online[model_name] == "undefined"){
    console.log(model_name + " is offline.");
    //removeModel(model_name);
    //return false;
  }else{

  if(globals.models_online[model_name].current_show == "private"){
    console.log(model_name + " is in a private show.");
    removeModel(model_name);
    return false;
  }
  if(globals.models_online[model_name].current_show == "hidden"){
    console.log(model_name + " is in a ticket show.");
    removeModel(model_name);
    return false;
  }
  }
  return true;
}

function getOpenCamCount(){
  return document.querySelectorAll("div#mainDiv div.free").length;
}

function readMessage(msg) {
  console.log(msg);
  let cmd = msg.data.split(" ");
  let url = `https://chaturbate.com/${cmd[1]}`;
  console.log("Loading:",url);
  if(!checkIfModelOnline(cmd[1])){
    return false;
  }
  let firstCam = false;
  if(getOpenCamCount() == 1){
    firstCam = true;
  }

  let check = document.body.querySelectorAll("div#mainDiv > div[name=\""+cmd[1]+"\"]")
  //let wins = document.querySelectorAll("div#mainDiv > div.free")
  let wins = document.querySelectorAll("div#mainDiv > div#empty")
  if (wins.length == 0 && !check.length) wins = addCamPlace(cmd[1])
  if (cmd[0] == "watch" && cmd[1].length > 0 && wins.length > 0 && !check.length) {

    wins[0].classList.remove('free');
    $(wins[0]).attr("id", cmd[1]);
    let request = new XMLHttpRequest();
    request.open('GET', url, true)
    request.setRequestHeader("Content-type","application/x-www-form-urlencoded")
    request.onload = function() {
      addCam(request.responseText, wins[0], cmd[1])

      if(firstCam){
        getChatPage(cmd[1]);
      }
    }
    request.send()
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

function addCamPlace(model_name) {
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

  for (let i =0; i < loops; i++){
    let newCam = camDiv(model_name);
    main.appendChild(newCam);
  }
  let newCam = main.querySelectorAll("div.free");
  main.className = mainClass
  //return main.querySelectorAll("div.free")
  return newCam
}

function cleanCams() {
  let main = document.querySelector('div#mainDiv')
  //let cams = main.querySelectorAll("div.free")
  let free_cams = document.querySelectorAll("div#mainDiv > div.free")
  let active_cams = document.querySelectorAll("div#mainDiv > div:not(.free)")
  let loops = 0

  for (let i =0; i < free_cams.length; i++) main.removeChild(free_cams[i])

  let len = active_cams.length

  //console.log("loops", loops)
  //console.log("active_cams", len)

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

  for (let i =0; i < loops; i++) main.appendChild(camDiv("empty"))
  main.className = mainClass
}

function camDiv(model_name) {
  let c = document.createElement('div')
  c.classList = 'cam ui-sortable-handle free'
  c.setAttribute("id", model_name);
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

function addCam(resp, holder, model) {
  let pos1 = resp.search('https://edge')
  let pos2 = resp.search('.m3u8')+5
  let stream = ''
  if (resp.includes('.m3u8')) { stream = resp.substring(pos1, pos2).replace(/\\u002D/g, '-') }
  else { stream = 'no data' }
  let poster = 'https://cbjpeg.stream.highwebmedia.com/stream?room='+model+'&f='+Math.random()
  let id = 'cam'+Math.floor(Math.random()*10000)
  //div.classList.remove('free')
  var holder = document.getElementById(model);
  holder.setAttribute("name", model)
  holder.innerHTML = `<video style="width: 100%; height: 100%;" id="${id}" class="video-js" poster="${poster}">
                   <source src="${stream}" type=""application/x-mpegURL""></source></video>`
  holder.appendChild(topButtons(model))
  const player = videojs(id, { controls: true, autoplay: true, preload: 'auto', fluid: false, enableLowInitialPlaylist: true })
  player.volume(0.5)
  if(!globals.open_rooms.includes(model)){
    globals.open_rooms.push(model);
  }
  cleanCams();
  updateCamStorage();
}

function openInTab(div){
    let model_name = div.getAttribute("name")
    let URL = `https://chaturbate.com/${model_name}`;
    window.open(URL, '_blank');
}

function refreshCam(div, model_name) {
  div.innerHTML = ''
  //div.classList.add('free')
  //let model_name = div.getAttribute("name")
  div.removeAttribute("name")

  let request = new XMLHttpRequest();
  request.open('GET', `https://chaturbate.com/${model_name}`, true)
  request.setRequestHeader("Content-type","application/x-www-form-urlencoded")
  request.onload = function() { addCam(request.responseText, div, model_name) }
  request.send()
}

function removeModel(model){
  if(globals.open_rooms.includes(model)){
    //Remove Cam
    let index = globals.open_rooms.indexOf(model);
    let x = globals.open_rooms.splice(index, 1);
    updateCamStorage();
  }
}

function removeCam(div, model) {
  div.innerHTML = ''
  div.classList.add('free')
  div.removeAttribute("name")
  div.appendChild(plusButton())
  removeModel(model);
  cleanCams()
  //console.log("REMOVE CHAT", model);
  //console.log("CURRENT CHAT", globals.current_chat);
  if(globals.current_chat == model){
    globals.current_chat = "";
    changeToMainWindowChat();
  }
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
        globals.chat.postMessage(`watch ` + user_data);
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

  let c = document.createElement('button')
  c.innerHTML = '💬'
  c.title = 'Load Chat'
  c.classList.add('topButton')

  top.appendChild(n)
  top.appendChild(c)
  top.appendChild(r)
  n.addEventListener('click', e => {
    e.preventDefault()
    openInTab(e.composedPath()[2])
  })
  r.addEventListener('click', e => {
    e.preventDefault()
    refreshCam(e.composedPath()[2], name)
  })

  c.addEventListener('click', e => {
    e.preventDefault()
    getChatPage(name);
    //refreshCam(e.composedPath()[2], name)
  })

  top.appendChild(x)
  x.addEventListener('click', e => {
    e.preventDefault()
    removeCam(e.composedPath()[2], name)
  })
  return top
}

function updateCamStorage(){
  GM_setValue("open_rooms", JSON.stringify(globals.open_rooms));
}

function getChatPage(model_name){
  if(model_name == globals.current_chat){
    return false;
  }
  $(".activeChat").removeClass("activeChat");
  $("#"+model_name).addClass("activeChat");
  $("#chatLabel").html("Loading " + model_name + "'s Chat...");
  $("#chatLoader").animate({height:"100%"},500);
  globals.current_chat = model_name;
  let div_iframe = $("#chatHolder");
  //$("#rightMenuHolder").append(div_iframe);

  let url = 'https://chaturbate.com/in/?tour=SHBY&campaign=yD0Pt&track=embed&disable_sound=1&room='+model_name;
  let iframe = $('<iframe id="iframe-pdf" scrolling="no" class="iframe-pdf" frameborder="0"></iframe>');
  iframe.css("height", "calc(100% - 5px - 50px)");
  iframe.css("padding-top", "50px");
  console.log(url);
  //div_iframe.hide();
  div_iframe.html("");
  div_iframe.append(iframe);

    function removeHiddenVideo(iframe, video_holder){
      if(iframe.contents().find(video_holder).length > 0){
          console.log("Video Exsists still.", iframe.contents().find(video_holder));
          iframe.contents().find(video_holder).remove();
      }else{
          clearInterval(videoInterval);
      }
    }

  function revealChat(){
      let video_holder = "#VideoPanel";
     let chat_identifier = ".TheatermodeChatDivChat";
    iframe.contents().find(video_holder).remove();
    iframe.contents().find(chat_identifier);
      videoInterval = setInterval(function(){
          removeHiddenVideo(iframe, video_holder);
      }, 1000);
    //let chat_holder = iframe.contents().find(chat_identifier);
    iframe.contents().find("#main").hide();
    let chat_window = iframe.contents().find(chat_identifier).detach();
    let chat_input = chat_window.find(".inputDiv").detach();
    //let chat_window = chat_holder.find(" .msg-list-wrapper-split:first").detach();
    //iframe.contents().find("body").html("");
    iframe.contents().find("body").append(chat_window);
    iframe.contents().find("body").append(chat_input);
    chat_window = iframe.contents().find(chat_identifier);
    //chat_window.style.height = "calc(100% - 28px)";
    chat_window.css("height", "calc(100% - 28px)");
    chat_window.css("position", "absolute");

    chat_input.css("position", "absolute");
    chat_input.css("bottom", "-5px");
    chat_input.css("width", "calc(100% - 10px)");

    $("#chatLabel").html(model_name + "'s Chat");
    $("#chatLoader").animate({height:"50px"},500);
  }

  iframe.on("load", function() {
    console.log("AFTER LOAD ROOMS", globals.open_rooms);
    let myTimeout = setTimeout(revealChat, 1000);
  });
  iframe.attr('src', url);

  return false
}

generalStuff();
