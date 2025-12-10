// ==UserScript==
// @name         cbplus_refactored_v9.0
// @namespace    https://github.com/Webdevdynamo/
// @version      9.0.0
// @description  Optimized Chaturbate Aggregator (UI Polish & Links)
// @author       Webdevdynamo
// @match        https://chaturbate.com/*
// @match        https://www.chaturbate.com/*
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
// @run-at       document-start
// ==/UserScript==

'use strict';

// --- ROUTER LOGIC ---
const isAppPage = window.location.pathname.includes('/cams-cbplus/');

if (!isAppPage) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectNavLink);
    } else {
        injectNavLink();
    }
} else {
    runApp();
}

function injectNavLink() {
    const nav = document.getElementById('nav');
    if (nav && !document.getElementById('cbplus_nav_link')) {
        const li = document.createElement('li');
        li.id = 'cbplus_nav_link';
        li.innerHTML = `<a href="/cams-cbplus/" style="color:#f47321; font-weight:bold; border:1px solid #f47321; padding: 0 10px; border-radius:4px;">GRID VIEW</a>`;
        if(nav.children.length > 0) {
            nav.insertBefore(li, nav.children[1]);
        } else {
            nav.appendChild(li);
        }
    }
}

// --- APP LOGIC ---
function runApp() {
    GM_addStyle(GM_getResourceText("vjCSS"));
    GM_addStyle(GM_getResourceText("jqCSS"));

    GM_addStyle(`
        body { display: none !important; }
        #cb_root {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: #121212; color: #eee; font-family: 'Arial', sans-serif;
            display: flex; flex-direction: column; z-index: 2147483647;
            font-size: 14px; line-height: 1.4;
        }
        /* Top Toolbar */
        #cb_top_toolbar {
            height: 40px; min-height: 40px; background: #222; border-bottom: 2px solid #444;
            display: flex; align-items: center; padding: 0 15px;
            justify-content: space-between; flex-shrink: 0; box-sizing: border-box; width: 100%;
            box-shadow: 0 2px 10px rgba(0,0,0,0.5);
        }
        .toolbar-group { display: flex; gap: 10px; align-items: center; }
        .tb-btn {
            background: #333; border: 1px solid #555; color: #ddd; padding: 6px 12px;
            cursor: pointer; border-radius: 4px; font-size: 12px; line-height: 1;
            font-weight: bold; text-transform: uppercase;
        }
        .tb-btn:hover { background: #444; border-color: #666; }
        .tb-btn.danger { background: #800; border-color: #a00; color: white; }

        /* Layout */
        #cb_app_container { display: flex; flex: 1; overflow: hidden; position: relative; width: 100%; height: 100%; }
        #mainDiv {
            flex: 1; display: grid;
            grid-template-columns: repeat(auto-fit, minmax(45%, 1fr));
            grid-auto-flow: dense; grid-auto-rows: min-content;
            gap: 10px; padding: 10px; overflow-y: auto; background: #000;
            justify-content: center; align-content: start;
        }
        .cam-card {
            background: #000; border: 1px solid #333; position: relative;
            aspect-ratio: 16/9; display: flex; flex-direction: column;
            transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.3); width: 100%;
        }
        .cam-card.featured {
            grid-column: 1 / -1; order: -1; border: 2px solid #f47321;
            box-shadow: 0 0 50px rgba(244, 115, 33, 0.3); z-index: 5;
            width: 100% !important; max-height: none;
        }

        /* Overlay UI */
        .cam-overlay {
            position: absolute; top: 0; left: 0; right: 0; height: 40px;
            background: linear-gradient(to bottom, rgba(0,0,0,0.9), transparent);
            z-index: 20; display: flex; justify-content: space-between;
            align-items: center; padding: 0 8px; opacity: 0;
            transition: opacity 0.2s ease-in-out; pointer-events: none;
        }
        .cam-card:hover .cam-overlay { opacity: 1; pointer-events: auto; }
        .cam-title {
            font-size: 14px; font-weight: bold; color: #fff;
            text-shadow: 1px 1px 2px #000; max-width: 120px;
            overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
            pointer-events: auto; /* Allow clicking the link */
        }
        .cam-title a { color: #fff; text-decoration: none; }
        .cam-title a:hover { color: #f47321; text-decoration: underline; }

        .cam-controls { display: flex; align-items: center; }
        .cam-btn {
            background: rgba(0,0,0,0.5); border: 1px solid #777; color: #fff;
            font-size: 14px; cursor: pointer; padding: 3px 6px; margin-left: 4px;
            border-radius: 3px; line-height: 1;
        }
        .cam-btn:hover { background: #f47321; border-color: #f47321; }
        .cam-btn.btn-star:hover { color: gold; border-color: gold; }
        .cam-btn.btn-heart { color: #fff; border-color: #777; }
        .cam-btn.btn-heart:hover { color: #ff0055; border-color: #ff0055; }
        .cam-btn.btn-heart.active { color: #ff0055; border-color: #ff0055; font-weight: bold; }
        .cam-btn.success { color: #0f0 !important; border-color: #0f0 !important; }

        #rightMenuHolder, #chatParent {
            width: 300px; min-width: 300px; display: flex; flex-direction: column;
            background: #222; border-left: 1px solid #444; z-index: 20; flex-shrink: 0;
        }
        #filter_menu { padding: 10px; background: #2a2a2a; border-bottom: 1px solid #444; }
        #card_holder { list-style: none; padding: 10px; margin: 0; overflow-y: auto; flex: 1; }

        .list-divider {
            background: #333; color: #f47321; font-weight: bold; font-size: 11px;
            padding: 5px 10px; text-transform: uppercase; letter-spacing: 1px;
            border-bottom: 1px solid #444; margin-top: 5px; margin-bottom: 5px;
        }

        /* NEW LARGE CARD LIST STYLE */
        .room_list_card {
            position: relative;
            margin-bottom: 12px;
            border-radius: 6px;
            overflow: hidden;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.5);
            background: #000;
            border: 1px solid #333;
            transition: transform 0.1s;
        }
        .room_list_card:hover { transform: scale(1.02); border-color: #555; }
        .room_list_card.followed { border: 1px solid #cfaa3d; } /* Gold border for follows */

        .room-thumb {
            width: 100%;
            height: auto;
            display: block;
            aspect-ratio: 16/9;
            object-fit: cover;
        }

        .room-info-overlay {
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            background: linear-gradient(to top, rgba(0,0,0,0.9), transparent);
            padding: 24px 8px 6px 8px;
            box-sizing: border-box;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }

        .room-name {
            font-weight: bold; color: #fff; font-size: 15px;
            text-shadow: 1px 1px 2px #000;
        }
        .room-viewers {
            font-size: 11px; color: #ddd;
            text-shadow: 1px 1px 2px #000;
        }

        #chatLoader { background: #f47321; color: white; padding: 5px; font-weight: bold; text-align: center; }
        .iframe-container { flex: 1; position: relative; }
        .iframe-container iframe { width: 100%; height: 100%; border: none; }
        .hidden { display: none !important; }
        .video-container { width: 100%; height: 100%; background: #000; }
    `);

    // --- CONFIG & STATE ---
    const Config = {
        apiRoot: 'https://chaturbate.com/api/public/affiliates/onlinerooms/?wm=HNwJw&format=json&client_ip=67.60.87.179',
        modelListUrl: 'https://chaturbate.com/api/ts/roomlist/room-list/?enable_recommendations=false&follow=true&limit=100&offline=false&offset=0&gender=f&gender=m&gender=c&gender=s',
        refreshInterval: 10000,
        blacklistPrefix: 'cbplus_blacklist_'
    };

    const State = {
        openRooms: [],
        modelsOnline: {},
        currentChat: null,
        activeVideoInterval: null,
        followedModels: new Set()
    };

    // --- HELPERS ---
    function isBlacklisted(username) {
        return localStorage.getItem(Config.blacklistPrefix + username) !== null;
    }

    // --- INIT ---
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initApp);
    } else {
        initApp();
    }

    function initApp() {
        console.log("CBPlus: App Loaded");
        const terms = document.querySelector('#close_entrance_terms');
        if (terms) terms.click();

        updateLocalState();
        renderAppUI();
        window.cbplus = { addCamToGrid, fetchModelList, State, purgeState };
    }

    function updateLocalState() {
        const savedRooms = GM_getValue("open_rooms");
        if (savedRooms) State.openRooms = JSON.parse(savedRooms);
        else State.openRooms = [];
    }

    function purgeState() {
        if(confirm("Purge all settings and reload?")) {
            GM_setValue("open_rooms", "[]");
            location.reload();
        }
    }

    // --- RENDER UI ---
    function renderAppUI() {
        document.title = 'CBPlus Grid v9.0';

        const root = document.createElement('div');
        root.id = 'cb_root';

        root.innerHTML = `
            <div id="cb_top_toolbar">
                <div class="toolbar-group">
                    <h2 style="margin:0; color:#f47321; font-size:18px;">CBPlus</h2>
                    <button id="btn_toggle_chat" class="tb-btn">Toggle Chat</button>
                    <button id="btn_toggle_list" class="tb-btn">Toggle List</button>
                </div>
                <div class="toolbar-group">
                     <button id="btn_refresh_list" class="tb-btn">↻ Refresh List</button>
                     <button id="btn_purge" class="tb-btn danger">⚠️ PURGE RESET</button>
                </div>
            </div>
            <div id="cb_app_container">
                <div id="mainDiv"></div>
                <div id="chatParent" class="hidden">
                    <div id="chatLoader">Select a model</div>
                    <div id="chatHolder" class="iframe-container"></div>
                </div>
                <div id="rightMenuHolder">
                    <div id="filter_menu">
                        <label><input type="checkbox" checked data-filter="gender" value="f"> F</label>
                        <label><input type="checkbox" checked data-filter="gender" value="c"> C</label>
                        <label><input type="checkbox" data-filter="gender" value="m"> M</label>
                        <label><input type="checkbox" data-filter="gender" value="s"> T</label>
                    </div>
                    <ul id="card_holder"></ul>
                </div>
            </div>
        `;

        document.documentElement.appendChild(root);

        document.getElementById('btn_refresh_list').onclick = fetchModelList;
        document.getElementById('btn_purge').onclick = purgeState;

        document.getElementById('btn_toggle_chat').onclick = () => {
            document.getElementById('chatParent').classList.toggle('hidden');
        };
        document.getElementById('btn_toggle_list').onclick = () => {
            document.getElementById('rightMenuHolder').classList.toggle('hidden');
        };

        const observer = new MutationObserver(() => {
            if (document.body && document.body.style.display !== 'none') {
                document.body.style.setProperty('display', 'none', 'important');
            }
        });
        if(document.body) {
            observer.observe(document.body, { attributes: true, attributeFilter: ['style'] });
            document.body.style.setProperty('display', 'none', 'important');
        }

        fetchModelList();
        setInterval(fetchModelList, Config.refreshInterval);

        setTimeout(() => {
            const uniqueRooms = [...new Set(State.openRooms)];
            uniqueRooms.forEach(room => addCamToGrid(room, false));
        }, 500);
    }

    // --- ACTIONS: LINEAR EXECUTION AGENT ---
    function toggleFollow(username, btnElement) {
        btnElement.innerHTML = '...';

        const agent = window.open(
            `https://chaturbate.com/${username}/`,
            'cb_agent',
            'width=100,height=100,left=9999,top=9999'
        );

        if (!agent) {
            alert("Popup blocked! Allow popups for Chaturbate.");
            btnElement.innerHTML = 'X';
            return;
        }

        const agentInterval = setInterval(() => {
            try {
                if (!agent || agent.closed) {
                    clearInterval(agentInterval);
                    return;
                }

                if (agent.document && agent.document.readyState === 'complete') {
                    const doc = agent.document;
                    const followDiv = doc.querySelector('div[data-testid="follow-button"]');
                    const unfollowDiv = doc.querySelector('div[data-testid="unfollow-button"]');

                    let clicked = false;

                    if (followDiv) {
                        const span = Array.from(followDiv.querySelectorAll('span')).find(s => s.innerText === "FOLLOW");
                        if(span) span.click();
                        followDiv.click();
                        clicked = true;
                    }
                    else if (unfollowDiv) {
                        const span = Array.from(unfollowDiv.querySelectorAll('span')).find(s => s.innerText === "UNFOLLOW");
                        if(span) span.click();
                        unfollowDiv.click();
                        clicked = true;
                    }

                    if (clicked) {
                        clearInterval(agentInterval);
                        setTimeout(() => {
                            if(!agent.closed) agent.close();

                            const isNowFollowed = btnElement.classList.contains('active');
                            if (isNowFollowed) btnElement.classList.remove('active');
                            else btnElement.classList.add('active');

                            btnElement.classList.add('success');
                            btnElement.innerHTML = '✔';
                            setTimeout(() => {
                                btnElement.classList.remove('success');
                                btnElement.innerHTML = '♥';
                                fetchModelList();
                            }, 1500);

                        }, 1000);
                    }
                }
            } catch(e) { /* Ignore */ }
        }, 50);

        setTimeout(() => {
            clearInterval(agentInterval);
            if(!agent.closed) agent.close();
            if(btnElement.innerHTML === '...') btnElement.innerHTML = '?';
        }, 10000);
    }

    // --- DATA ---
    async function fetchModelList() {
        try {
            const listContainer = document.getElementById('card_holder');
            if(!listContainer) return;

            const genderInputs = document.querySelectorAll('#filter_menu input[data-filter="gender"]:checked');
            const activeGenders = Array.from(genderInputs).map(input => input.value);
            const genderParams = activeGenders.map(g => `&gender=${g}`).join('');
            const publicUrl = `${Config.apiRoot}&limit=500${genderParams}`;

            let followedData = { rooms: [] };
            let publicData = { results: [] };

            const pFollowed = fetch(Config.modelListUrl, { credentials: 'include' })
                .then(res => res.ok ? res.json() : { rooms: [] })
                .catch(e => { console.warn("CBPlus: Followed Error", e); return { rooms: [] }; });

            const pPublic = fetch(publicUrl)
                .then(res => res.ok ? res.json() : { results: [] })
                .catch(e => { console.warn("CBPlus: Public Error", e); return { results: [] }; });

            [followedData, publicData] = await Promise.all([pFollowed, pPublic]);

            listContainer.innerHTML = '';
            State.followedModels.clear();

            // RENDER FOLLOWED
            const fList = followedData.rooms || followedData.results || [];
            if(fList.length > 0) {
                const header = document.createElement('div');
                header.className = 'list-divider';
                header.innerText = `⭐ Your Followed Models (${fList.length})`;
                listContainer.appendChild(header);

                fList.forEach(model => {
                    model.username = model.username || model.room;
                    State.followedModels.add(model.username);
                    if(model.username && !isBlacklisted(model.username)) {
                        renderSidebarCard(model, true);
                    }
                });
            }

            // RENDER PUBLIC
            if(publicData && publicData.results) {
                const header = document.createElement('div');
                header.className = 'list-divider';
                header.innerText = `🌐 Public Cams`;
                listContainer.appendChild(header);

                publicData.results.forEach(model => {
                    if (!State.followedModels.has(model.username)) {
                        if(!isBlacklisted(model.username)) {
                            renderSidebarCard(model, false);
                        }
                    }
                });
            }

            if (listContainer.children.length === 0) {
                 listContainer.innerHTML = '<li style="padding:10px; color:#888;">No models found. Check console for API errors.</li>';
            }

        } catch (e) { console.error("CBPlus: Render Error", e); }
    }

    function renderSidebarCard(model, isFollowed) {
        const username = model.username || model.room || "Unknown";
        const imgUrl = model.image_url || model.img || `https://roomimg.stream.highwebmedia.com/riw/${username}.jpg`;
        const fallbackImg = 'https://web.static.mmcdn.com/images/default-room.png';

        const li = document.createElement('li');
        // New Card Style Class
        li.className = isFollowed ? 'room_list_card followed' : 'room_list_card';

        li.innerHTML = `
            <img src="${imgUrl}" class="room-thumb" onerror="this.onerror=null;this.src='${fallbackImg}';">
            <div class="room-info-overlay">
                <span class="room-name">${username}</span>
                <span class="room-viewers">${model.num_users || 0}</span>
            </div>
        `;

        // Single Click Event
        li.onclick = () => addCamToGrid(username, true);

        document.getElementById('card_holder').appendChild(li);
    }

    // --- CAM LOGIC ---
    async function addCamToGrid(modelName, isManualAdd = false, retryCount = 0) {
        if (State.openRooms.length >= 6 && !document.getElementById(`cam_${modelName}`)) {
            alert("Maximum 6 Cams Limit Reached!");
            return;
        }

        const existing = document.getElementById(`cam_${modelName}`);
        if(existing && retryCount === 0) {
            existing.scrollIntoView({ behavior: 'smooth' });
            existing.classList.add('highlight');
            setTimeout(() => existing.classList.remove('highlight'), 1000);
            return;
        }

        const grid = document.getElementById('mainDiv');
        let card = document.getElementById(`cam_${modelName}`);

        const isFollowing = State.followedModels.has(modelName);
        const heartClass = isFollowing ? 'btn-heart active' : 'btn-heart';

        if (!card) {
            card = document.createElement('div');
            card.id = `cam_${modelName}`;
            card.className = 'cam-card';
            // TITLE IS NOW A LINK
            card.innerHTML = `
                <div class="cam-overlay">
                    <div class="cam-title">
                        <a href="https://chaturbate.com/${modelName}/" target="_blank">${modelName}</a>
                    </div>
                    <div class="cam-controls">
                        <button class="cam-btn btn-star" title="Spotlight">★</button>
                        <button class="cam-btn ${heartClass}" title="Toggle Follow">♥</button>
                        <button class="cam-btn btn-focus" title="Mute Others">👁️</button>
                        <button class="cam-btn btn-chat" title="Load Chat">💬</button>
                        <button class="cam-btn btn-refresh" title="Reload">↻</button>
                        <button class="cam-btn btn-close" title="Close">❌</button>
                    </div>
                </div>
                <div class="video-container"></div>
            `;
            grid.prepend(card);

            card.querySelector('.btn-close').onclick = () => {
                if(window.videoPlayers && window.videoPlayers[modelName]) window.videoPlayers[modelName].dispose();
                card.remove();
                removeFromState(modelName);
            };
            card.querySelector('.btn-refresh').onclick = () => {
                if(window.videoPlayers && window.videoPlayers[modelName]) window.videoPlayers[modelName].dispose();
                card.remove();
                addCamToGrid(modelName, true);
            };
            card.querySelector('.btn-chat').onclick = () => {
                loadChat(modelName);
                document.getElementById('chatParent').classList.remove('hidden');
            };
            card.querySelector('.btn-focus').onclick = () => {
                 document.querySelectorAll('video').forEach(v => {
                    if(!v.closest(`#cam_${modelName}`)) v.muted = true;
                    else v.muted = false;
                });
            };
            card.querySelector('.btn-star').onclick = () => toggleFeatured(card);

            card.querySelector('.btn-heart').onclick = function() {
                toggleFollow(modelName, this);
            };
        }

        try {
            const response = await fetch(`https://chaturbate.com/${modelName}/`);
            const html = await response.text();

            let streamUrl = null;
            let match = html.match(/https:(?:\\\/|[^"'])*?\.m3u8/);
            if (match) streamUrl = match[0].replace(/\\\//g, '/').replace(/\\u002D/g, '-');

            const videoContainer = card.querySelector('.video-container');

            if (!streamUrl) {
                videoContainer.innerHTML = `<div style="color:red; text-align:center; padding-top:20%;">Offline / Private</div>`;
                removeFromState(modelName);
                setTimeout(() => card.remove(), 5000);
                return;
            }

            const videoId = `vid_${modelName}_${Math.floor(Math.random()*10000)}`;
            const poster = `https://cbjpeg.stream.highwebmedia.com/stream?room=${modelName}&f=${Math.random()}`;
            const fallbackPoster = 'https://web.static.mmcdn.com/images/default-room.png';

            videoContainer.innerHTML = '';
            const videoEl = document.createElement('video');
            videoEl.id = videoId;
            videoEl.className = 'video-js';
            videoEl.controls = true;
            videoEl.autoplay = true;
            videoEl.preload = 'auto';

            videoEl.poster = poster;
            videoEl.onerror = () => { videoEl.poster = fallbackPoster; };

            videoEl.style.width = '100%';
            videoEl.style.height = '100%';

            const sourceEl = document.createElement('source');
            sourceEl.src = streamUrl;
            sourceEl.type = 'application/x-mpegURL';
            videoEl.appendChild(sourceEl);
            videoContainer.appendChild(videoEl);

            requestAnimationFrame(() => {
                const player = videojs(videoId, {
                    controlBar: { children: ['playToggle', 'volumePanel', 'fullscreenToggle'] },
                    fluid: false
                });

                window.videoPlayers = window.videoPlayers || {};
                window.videoPlayers[modelName] = player;

                player.ready(() => {
                    player.volume(0.5);
                    const promise = player.play();
                    if (promise !== undefined) {
                        promise.catch(() => {
                            player.muted(true);
                            player.play();
                        });
                    }
                });

                player.on('error', () => {
                    if (retryCount < 3) {
                        player.dispose();
                        videoContainer.innerHTML = `<div style="color:orange; text-align:center; padding-top:20%;">Reconnecting (${retryCount+1}/3)...</div>`;
                        setTimeout(() => addCamToGrid(modelName, false, retryCount + 1), 2000);
                    } else {
                        card.classList.add('error-state');
                        videoContainer.innerHTML = `<div style="color:red; text-align:center; padding-top:20%;">Stream Failed</div>`;
                    }
                });
            });

            if (isManualAdd) saveToState(modelName);

        } catch (e) {
            console.error(e);
            card.innerHTML = `<div style="color:red; padding:20px;">Error loading ${modelName}</div>`;
            removeFromState(modelName);
        }
    }

    function toggleFeatured(targetCard) {
        const isAlreadyFeatured = targetCard.classList.contains('featured');
        document.querySelectorAll('.cam-card').forEach(c => c.classList.remove('featured'));
        const chatParent = document.getElementById('chatParent');

        if (!isAlreadyFeatured) {
            targetCard.classList.add('featured');
            const modelName = targetCard.id.replace('cam_', '');

            const featuredVideo = targetCard.querySelector('video');
            if (featuredVideo) {
                document.querySelectorAll('video').forEach(v => {
                    if (v.id !== featuredVideo.id) v.muted = true;
                    else v.muted = false;
                });
            }
            chatParent.classList.remove('hidden');
            loadChat(modelName);
        } else {
            document.querySelectorAll('video').forEach(v => { v.muted = false; });
            chatParent.classList.add('hidden');
        }
    }

    function saveToState(model) {
        let currentRooms = JSON.parse(GM_getValue("open_rooms", "[]"));
        if (!currentRooms.some(r => r.toLowerCase() === model.toLowerCase())) {
            currentRooms.push(model);
            State.openRooms = currentRooms;
            GM_setValue("open_rooms", JSON.stringify(currentRooms));
        }
    }

    function removeFromState(model) {
        let currentRooms = JSON.parse(GM_getValue("open_rooms", "[]"));
        const newRooms = currentRooms.filter(r => r.toLowerCase() !== model.toLowerCase());
        State.openRooms = newRooms;
        GM_setValue("open_rooms", JSON.stringify(newRooms));
    }

    function loadChat(modelName) {
        if (State.currentChat === modelName) return;
        State.currentChat = modelName;
        const holder = document.getElementById('chatHolder');
        const label = document.getElementById('chatLoader');
        label.innerText = `Loading ${modelName}...`;
        holder.innerHTML = '';

        const iframe = document.createElement('iframe');
        iframe.src = `https://chaturbate.com/in/?tour=SHBY&campaign=yD0Pt&track=embed&disable_sound=1&sound=0&room=${modelName}`;
        holder.appendChild(iframe);

        const nukeAudio = () => {
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                if(!doc) return;

                const media = doc.querySelectorAll('video, audio');
                media.forEach(m => {
                    m.muted = true;
                    m.volume = 0;
                    m.pause();
                });

                const panel = doc.getElementById('VideoPanel');
                if(panel) {
                    panel.style.display = 'none';
                }
            } catch(e) {}
        };

        if (State.activeVideoInterval) clearInterval(State.activeVideoInterval);
        State.activeVideoInterval = setInterval(() => {
            nukeAudio();
            try {
                const doc = iframe.contentDocument || iframe.contentWindow.document;
                const chatBox = doc.querySelector('.TheatermodeChatDivChat');
                if(chatBox) {
                    const body = doc.body;
                    const inputDiv = doc.querySelector('.inputDiv');
                    if(body.childNodes.length > 5) {
                        body.innerHTML = '';
                        body.appendChild(chatBox);
                        if(inputDiv) body.appendChild(inputDiv);

                        chatBox.style.height = 'calc(100% - 40px)';
                        chatBox.style.position = 'absolute';
                        chatBox.style.top = '0';
                        if(inputDiv) {
                            inputDiv.style.position = 'absolute';
                            inputDiv.style.bottom = '0';
                            inputDiv.style.width = '100%';
                        }
                        label.innerText = `${modelName}`;
                        label.style.background = '#333';
                    }
                }
            } catch(e) {}
        }, 100);
    }
}
