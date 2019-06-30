$ (function(){

    var socket = io('/chat');
  
    var username = document.getElementById('me').innerHTML;
    var roomId;//variable for setting room.
    var toUser;
    var stt = -1;
    $('#chat1').hide();

    //passing data on connection.
    socket.on('connect',function(){
      socket.emit('set-user-data',username);
      $('#myInfo').append($('<h5>').append(username)).append('<span>Ho Chi Minh</span>');
    });

    //receiving onlineList
    socket.on('onlineList',function(list){
      $('#list').empty();
      $('#list_msg').empty();
      stt = -1;
      for (var user in list){
        //setting txt1. shows users button.
        if(user != username){
          stt += 1;
          var img = '<img src="../../images/chat/avatars/default.svg" alt="avatar">';
          var name_friend = '<h5 id="friend_id_' + stt + '">' + user + '</h5>';
          var user_info = $('<div class="content">').append($('<h5>').append(user)).append('<span>Ho Chi Minh</span>');
          var icon = $('<div class="icon"><i data-eva="person"></i></div>');
          var user_msg = $('<div class="content">').append($('<div class="headline">').append($(name_friend)).append('<span>Hôm nay</span>')).append($('<p>Tin nhắn</p>'));
        }
        else{
            continue;
        }
        //setting txt2. shows online status.
        if(list[user] == "Online"){
          var status = $('<div class="status online">').append($(img)).append($('<i data-eva="radio-button-on">'));
          var status1 = $('<div class="status online">').append($(img)).append($('<i data-eva="radio-button-on">'));
        }
        else{
          var status = $('<div class="status offline">').append($(img)).append($('<i data-eva="radio-button-on">'));
          var status1 = $('<div class="status offline">').append($(img)).append($('<i data-eva="radio-button-on">'));
        }
        //listing all users.
        $('#list').append($('<li>').append($('<a href="#">').append(status, user_info, icon)));
        eva.replace();
        $('#list_msg').append($('<li>').append($('<a href="#chat1" class="filter direct active" data-chat="open" data-toggle="tab" role="tab" aria-controls="chat1" aria-selected="true">').append(status1, user_msg)));
        eva.replace();
      }
    });
  
  
    //Click on btnMsg
    $('#list_msg').on("click", 'li', function(){
      $('#list_detail_msg').empty();
      $('#receiverInfo').empty();
      $('#chat1').show();
      
      toUser = document.getElementById('friend_id_' + $(this).index()).innerHTML;
      $('#receiverInfo').append($('<h5>').append(toUser)).append('<span>Ho Chi Minh</span>');
      var room1 = username + '-' + toUser;
      var room2 = toUser + '-' + username;
      //event to set room and join.
      socket.emit('set-room', {name1: room1, name2: room2});
    });
  
    //event for setting roomId.
    socket.on('set-room-user',function(room){
      //empty messages.
      $('#list_detail_msg').empty();

      //assigning room id to roomId variable. which helps in one-to-one and group chat.
      roomId = room;
      console.log("roomId : "+ roomId);
      //event to get chat history on button click or as room is set.
      socket.emit('old-msg-init',{room:roomId,username:username});
  
    }); //end of set-room event.
  
    //listening old-chats event.
    socket.on('old-msg',function(data){
  
      if(data.room == roomId){
        if(data.result.length != 0){

          for (var i = data.result.length - 1; i >= 0; i--) {
            //styling of chat message.
            if(data.result[i].msgFrom == username) {
              //styling of chat message.
              var image = '<img style="margin-right: 0; margin-left: 15px;" src="images/chat/avatars/default.svg" alt="avatar">';
              var content = '<div class="content"><div class="message"><div style="background: #007bff;" class="bubble"><p>' + data.result[i].msg + '</p></div></div>'+'</div>';
              //showing chat in chat box.
              $('#list_detail_msg').append($('<li style="flex-direction: row; justify-content: flex-end; text-align: right">')
              .append($(image), $(content)));
    
            } else {
              var image = '<img style="margin-right: 15px; margin-left: 0;" src="images/chat/avatars/default.svg" alt="avatar">';
              var content = '<div class="content"><div class="message"><div style="background: #f5f5f5;" class="bubble"><p style="color: black">' + data.result[i].msg + '</p></div></div>'+'</div>';
              //showing chat in chat box.
              $('#list_detail_msg').append($('<li style="flex-direction: row-reverse; justify-content: flex-end; text-align: left">').append($(image), $(content)));
            }
          } 
        }
      }
  
    });
  
    //sending message.
    $('#form_msg').submit(function(){
      socket.emit('send-msg',{msg:$('#input_msg').val(),msgTo:toUser,date:Date.now()});
      $('#input_msg').val("");
      return false;
    });
    
    //Press enter to send messages
    $('#input_msg').keypress(function (e) {
      if($('#input_msg').val()){
        if (e.which == 13) {
          $('#form_msg').submit();
          return false;
        }
      }
    });

    //receiving messages.
    socket.on('detail-msg',function(data){

          if(data.msgFrom == username) {
            //styling of chat message.
            var image = '<img style="margin-right: 0; margin-left: 15px;" src="images/chat/avatars/default.svg" alt="avatar">';
            var content = '<div class="content"><div class="message"><div style="background: #007bff;" class="bubble"><p>' + data.msg + '</p></div></div>'+'</div>';
            //showing chat in chat box.
            $('#list_detail_msg').append($('<li style="flex-direction: row; justify-content: flex-end; text-align: right">')
            .append($(image), $(content)));
  
          } else {
            var image = '<img style="margin-right: 15px; margin-left: 0;" src="images/chat/avatars/default.svg" alt="avatar">';
            var content = '<div class="content"><div class="message"><div style="background: #f5f5f5;" class="bubble"><p style="color: black">' + data.msg + '</p></div></div>'+'</div>';
            //showing chat in chat box.
            $('#list_detail_msg').append($('<li style="flex-direction: row-reverse; justify-content: flex-end; text-align: left">').append($(image), $(content)));
          }
        }
    );
  
    //on disconnect event.
    //passing data on connection.
    socket.on('disconnect',function(){
    });
});