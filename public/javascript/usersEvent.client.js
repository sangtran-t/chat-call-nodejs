"use strict";

navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

const idCaller = $('#id_me').val();
const peer = new Peer(idCaller);

peer.on('open', id => console.log('callerId: ' + id));

//Open media when call event
var openStream = () => {
    var configs = { video: true, audio: false };
    console.log(navigator.getUserMedia);
    return navigator.mediaDevices.getUserMedia(configs);
}

var playStream = (open, videoTag, stream) => {
    const video = open.document.getElementById(videoTag);
    video.srcObject = stream;
    video.play();
}

//Event Call 
var Call = (btnClicked) => {
    var idCallee = $(btnClicked).attr('value');
    var open = window.open('/videocall/incall/?peerId=' + idCallee, '_blank', 'width=1200, height=700, resizable=0');
    openStream()
        .then(stream => {
            playStream(open, 'localStream', stream);
            const call = peer.call(idCallee, stream);
            console.log('calleeId: ' + idCallee);
            call.on('stream', remoteStream => playStream(open, 'remoteStream', remoteStream));
        })
        .catch(e => console.log(e));
}

//Listen on call 
peer.on('call', async call => { 
    var data = await $.ajax({   
        url: '/user/' + call.peer,
        method: 'GET',
        success: function(data){
            return data;
        },
        error: function(err){
            console.log(err)
            return null;
        }
    })
    
    if (data) {
        var result = await swal(data+" đang gọi bạn...", {
            buttons: ["Từ chối!", "Trả lời!"],
            closeOnClickOutside: false,
        });
        if(result){
            var open = window.open('/videocall/incall/?peerId=' + call.peer, '_blank', 'width=1200, height=700, resizable=0');
            openStream()
                .then(stream => {
                    playStream(open, 'localStream', stream);
                    call.answer(stream);
                    call.on('stream', remoteStream => playStream(open, 'remoteStream', remoteStream));
                    call.on('close', () => {alert("The videocall has finished");});
                })
                .catch(e => console.log(e));
        }
    }
});

var viewInfo = (id) => {
    event.preventDefault();
    $.get({
        url: '/user/' + id,
        method: 'GET',
        success: function(data){
            window.history.pushState(data, 'Real Times App', id);
            $('#peerName').html(data.name);
            $('#videoCall').val(data._id);
            console.log(data)
        },
        error: function(err){
            console.log(err)
        }
    })
}

$(document).ready(function () {
    $('input:file').change(
        function(){
            if ($(this).val()) {
                $('#avatarSubmit').attr('disabled',false);
                $('#avatarSubmit').css('background-color', '#007bff')
            } 
        }
    );


    $("#avatarUpdate").submit(function(e) {
        e.preventDefault();
        var form = $(this);
        $.ajax({
            type: "POST",
            url: 'user/updateinfo?userId='+idCaller,
            data: new FormData( this ),
            processData: false,
            contentType: false,
            success: function(data, textStatus, jqXHR) {
                $('#avatarModal').modal('hide');
                $("#userInfo").attr("src", data);
                swal({
                    title: "Success!",
                    text: "Success update!",
                    icon: "success",
                    button: "OK",
                });
            },
            error: function(jqXHR, status, error) {
                console.log(status + ": " + error);
            }
        });
    });
});

