var yt, timer;
    var trackTitles = []; 

    document.getElementById('year-display').innerHTML = new Date().getFullYear();

    // Keyboard Shortcut: Space for Play/Pause
    window.addEventListener('keydown', function(e) {
        if(e.code === 'Space' && e.target.tagName !== 'INPUT') {
            e.preventDefault();
            togglePlay();
        }
    });

    // Enter Key for Input
    document.getElementById('url-in').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') playKirin();
    });

    // --- BAHAGIAN YANG DIBAIKI ---
    function onYouTubeIframeAPIReady() {
        console.log("YouTube API sedia");
    }
    // -----------------------------

    function playKirin() {
        var u = document.getElementById('url-in').value.trim();
        if(!u) return;

        var a = document.getElementById('aud-engine');
        var r = document.getElementById('radio-visual');
        var y = document.getElementById('player-yt');
        var l = document.getElementById('live-tag');

        // Reset Everything
        if(yt && yt.destroy) {
            try { yt.destroy(); } catch(e) {}
        }
        clearInterval(timer);
        a.pause(); a.src = "";
        y.style.display = 'none'; 
        r.style.display = 'flex'; 
        l.style.display = 'none';
        resetUI();
        trackTitles = []; 

        // YouTube Logic (Termasuk support Music YouTube)
        if(u.includes('youtube') || u.includes('youtu.be')) {
            y.style.display = 'block'; 
            r.style.display = 'none';
            
            yt = new YT.Player('player-yt', {
                height: '100%', width: '100%',
                videoId: getID(u),
                playerVars: {
                    'autoplay': 1,
                    'listType': u.includes('list=') ? 'playlist' : null,
                    'list': getParam(u, 'list'),
                    'origin': window.location.origin,
                    'enablejsapi': 1
                },
                events: {
                    'onReady': syncYT, 
                    'onStateChange': function(e) {
                       syncYT();
                       var btn = document.getElementById('main-play-btn');
                       if(e.data === 1) { 
                           btn.innerHTML = '&#10074;&#10074;'; 
                           renderList(); 
                       } else { 
                           btn.innerHTML = '&#9654;'; 
                       }
                    }
                }
            });
        } 
        // Audio/Radio Logic
        else {
            a.src = u; 
            a.play().catch(function(e) { console.log("Autoplay blocked"); });
            document.getElementById('main-play-btn').innerHTML = '&#10074;&#10074;';
            document.getElementById('track-title').innerHTML = "Streaming Audio";
            document.getElementById('track-artist').innerHTML = u.split('/')[2] || "Online Stream";
            
            if(u.includes('stream') || u.includes('.mp3?') || u.includes('m3u8')) {
               l.style.display = 'block';
               document.getElementById('total-time').innerHTML = "LIVE";
            }
        }
        document.getElementById('url-in').blur();
        document.getElementById('url-in').value = '';
    }

    function togglePlay() {
        var btn = document.getElementById('main-play-btn');
        if(yt && yt.getPlayerState) {
            var s = yt.getPlayerState();
            if(s == 1) { yt.pauseVideo(); btn.innerHTML = '&#9654;'; } 
            else { yt.playVideo(); btn.innerHTML = '&#10074;&#10074;'; }
        } else {
            var a = document.getElementById('aud-engine');
            if(a.paused) { a.play(); btn.innerHTML = '&#10074;&#10074;'; } 
            else { a.pause(); btn.innerHTML = '&#9654;'; }
        }
    }

    function nextTrack() { if(yt && yt.nextVideo) yt.nextVideo(); }
    function prevTrack() { if(yt && yt.previousVideo) yt.previousVideo(); }

    function syncYT() {
        if(timer) clearInterval(timer);
        timer = setInterval(() => {
            if(yt && yt.getVideoData && yt.getCurrentTime) {
                var d = yt.getVideoData();
                document.getElementById('track-title').innerHTML = d.title || "Playing...";
                document.getElementById('track-artist').innerHTML = d.author || "YouTube Music";
                updateUI(yt.getCurrentTime(), yt.getDuration());
            }
        }, 1000);
    }

    function renderList() {
        if(yt && yt.getPlaylist) {
            var list = yt.getPlaylist();
            var container = document.getElementById('list-items');
            if(list && list.length > 0) {
                container.innerHTML = "";
                list.forEach((id, index) => {
                    var item = document.createElement('div');
                    var currentIndex = yt.getPlaylistIndex ? yt.getPlaylistIndex() : -1;
                    var isCurrent = (index === currentIndex);
                    var label = trackTitles[index] ? trackTitles[index] : "Track #" + (index + 1);
                    
                    item.className = 'song-item' + (isCurrent ? ' active' : '');
                    item.innerHTML = label + (isCurrent ? " - Playing" : "");
                    
                    item.onclick = function() { 
                        yt.playVideoAt(index); 
                        setTimeout(toggleDrawer, 300); 
                    };
                    container.appendChild(item);
                });
            }
        }
    }

    function toggleDrawer() { document.getElementById('drawer').classList.toggle('open'); }
    
    function updateAudio() {
        var a = document.getElementById('aud-engine');
        if(a.duration && a.duration !== Infinity) updateUI(a.currentTime, a.duration);
    }

    function updateUI(c, d) {
        if(!d) return;
        document.getElementById('progress-bar').style.width = (c/d*100) + "%";
        document.getElementById('cur-time').innerHTML = fTime(c);
        document.getElementById('total-time').innerHTML = fTime(d);
    }

    function fTime(s) {
        var m = Math.floor(s/60), sc = Math.floor(s%60);
        return m + ":" + (sc < 10 ? '0' : '') + sc;
    }

    function resetUI() {
        document.getElementById('progress-bar').style.width = "0%";
        document.getElementById('cur-time').innerHTML = "0:00";
        document.getElementById('total-time').innerHTML = "0:00";
    }

    function getID(u) {
        var reg = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        var m = u.match(reg);
        if (m && m[2].length == 11) return m[2];
        // Backup untuk link YouTube Music
        if (u.includes('v=')) return u.split('v=')[1].split('&')[0];
        return "";
    }

    function getParam(url, n) {
        var r = new RegExp("[\\?&]" + n + "=([^&#]*)"), res = r.exec(url);
        return res === null ? "" : decodeURIComponent(res[1].replace(/\+/g, " "));
    }
