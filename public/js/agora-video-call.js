const config = {
    mode: 'rtc',
    codec: 'vp8'
}

const rtc = {
    client: null,
    localVideoTrack: null,
    localAudioTrack: null,
}

const btnCam = $('#btnCam');
const btnMic = $('#btnMic');
const btnPlug = $('#btnPlug');
const remote = $('#remote');
const local = $('#local');

const join = async() => {
    rtc.client = AgoraRTC.createClient(config);
    await rtc.client.join(options.appId, options.channel, options.token || null);
}

async function startOneToOneVideoCall() {
    join().then(() => {
        startVideo();
        startAudio();
        rtc.client.on('user-published', async(user, mediaType) => {
            if (rtc.client._users.length > 1) {
                rtc.client.leave();
                remote.html('<div class="roomMessage"><p class="full">Please Wait Room is Full</p></div>');
                return;
            } else {
                remote.html('');
            }

            await rtc.client.subscribe(user, mediaType);
            if (mediaType === 'video') {
                const remoteVideoTrack = user.videoTrack;
                remoteVideoTrack.play('remote');

            }
            if (mediaType === 'audio') {
                const remoteAudioTrack = user.audioTrack;
                remoteAudioTrack.play()
            }
        });

        rtc.client.on('user-left', function (user) {
            console.log('User ' + user.uid + ' has left the channel');
            alert('User has left the call');
        });
    });
}

const startVideo = async() => {
    rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
    await rtc.client.publish(rtc.localVideoTrack);
    await rtc.localVideoTrack.play('local');
}

const startAudio = async () => {
    rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    await rtc.client.publish(rtc.localAudioTrack);
    await rtc.localAudioTrack.play();
}

const stopVideo = async () => {
    await rtc.localVideoTrack.close();
    await rtc.localVideoTrack.stop();
    await rtc.client.unpublish(rtc.localVideoTrack);
}

const stopAudio = async () => {
    await rtc.localAudioTrack.close();
    await rtc.localAudioTrack.stop();
    await rtc.client.unpublish(rtc.localAudioTrack);
}
//Toggle Camera

btnCam.click(function() {
    if ($(this).hasClass('fa-video-camera')) {
        $(this).addClass('fa-video-slash');
        $(this).removeClass('fa-video-camera');
        $(this).css('color', 'red');
        stopVideo();
    } else {
        $(this).addClass('fa-video-camera');
        $(this).removeClass('fa-video-slash');
        $(this).css('color', 'black');
        startVideo();
    }
});

//Toggle Microphone
btnMic.click(function() {
    if ($(this).hasClass('fa-microphone')) {
        $(this).addClass('fa-microphone-slash');
        $(this).removeClass('fa-microphone');
        $(this).css('color', 'red');
        stopAudio()

    } else {
        $(this).addClass('fa-microphone');
        $(this).removeClass('fa-microphone-slash');
        $(this).css('color', 'black');
        startAudio();
    }
});

//Toggle Join and Leave

btnPlug.click(async function() {
    if ($(this).hasClass('fas fa-phone')) {
        $(this).addClass('fa-window-close');
        $(this).removeClass('fas fa-phone');
        $(this).css('color', 'red');
        await startOneToOneVideoCall();
    } else {
        $(this).addClass('fas fa-phone');
        $(this).removeClass('fa-window-close');
        $(this).css('color', 'black');
        rtc.client.leave();
        stopVideo();
        stopAudio();
        $(".video-call").addClass('d-none');
    }
});

const draggable = document.getElementById("draggable");

let isDragging = false;
let offsetX, offsetY;

draggable.addEventListener("mousedown", (e) => {
  isDragging = true;
  offsetX = e.clientX - draggable.offsetLeft;
  offsetY = e.clientY - draggable.offsetTop;
});

document.addEventListener("mousemove", (e) => {
  if (isDragging) {
    draggable.style.left = `${e.clientX - offsetX}px`;
    draggable.style.top = `${e.clientY - offsetY}px`;
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});
