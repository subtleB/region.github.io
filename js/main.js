//https://oauth.vk.com/authorize?&display=popup&client_id=6639687&redirect_uri=https://oauth.vk.com/blank.html&scope=groups,messages,wall,offline&response_type=token&v=5.62


$('document').ready(function() {

    //var url = new URL(document.URL.replace("#", "?"));
    //var TOKEN = url.searchParams.get("access_token");
    //console.log(TOKEN);
    //if (TOKEN) {
    //    $('#login').hide();
    //}

    var TOKEN = "";

    var checkedFlag = true;
    //getName();
    //displayAllGroups();

    $('.go').submit(function(e) {
        e.preventDefault();
        var msg = $('#msg').val();
        var photo = $('#photo').val();

        $('#goBtn').hide();

        var interval = 0;
        var groups = $('#groups').find("input");
        for (var i = 0; i < groups.length; i++) {
            if (groups[i].checked) {
                interval++;
                setTimeout(post, 500 * interval, groups[i], msg, photo);
            }
        }

        setTimeout(function() {
            $('#goBtn').show();
        }, 1000);
    });

    $('#sendMsg').click(function(e) {
        e.preventDefault();
        var msg = $('#privateMsg').val();
        sendToNewWallLikes(msg);
        //sendMsg(103767511, msg);
    });

    $('#checkSwitch').click(function(e) {
        var groups = $('#groups').find("input");
        for (var i = 0; i < groups.length; i++) {
            groups[i].checked = checkedFlag;
        }
        checkedFlag = checkedFlag ? false : true;
    });

    $('#token').on('input',function(e){
        var url = new URL( $('#token').val().replace("#", "?"));
        TOKEN = url.searchParams.get("access_token");
        getName();
    });

    function post(inputBox, msg, photo) {
        var id = $(inputBox).val();
        console.log(id);

        $.ajax({
            dataType: 'jsonp',
            method: 'GET',
            url: 'https://api.vk.com/method/wall.post?owner_id=-' + id + '&message=' + msg 
                            + '&attachments=' + photo + '&access_token=' + TOKEN + '&v=5.62', 
            success: function(res) {
                console.log(res);
                $(inputBox).parent().css("background-color","green");
                setTimeout(function() {
                    $(inputBox).parent().css("background-color","initial");
                }, 5000);
            }
        });
    };

    // Getting all the posts ids from token page with likes > 0.
    function sendToNewWallLikes(msg) {
        $.ajax({
            dataType: 'jsonp',
            method: 'GET',
            async: false,
            url: 'https://api.vk.com/method/wall.get?filter=all&access_token=' + TOKEN + '&v=5.62',
            success: function(res) {
                //getNewUserIdsByPost(res.response.items[1].id, msg);
                for (var i = 0; i < res.response.items.length; i++) {
                    if (res.response.items[i].likes.count > 0) {
                        getNewUserIdsByPost(res.response.items[i].id, msg);
                    }
                }
            }
        });
    };

    function getNewUserIdsByPost(postId, msg) {
        console.log(postId);
        var userIds = [];
        $.ajax({
            dataType: 'jsonp',
            method: 'GET',
            url: 'https://api.vk.com/method/likes.getList?type=post&item_id=' 
                            + postId + '&skip_own=1&access_token=' + TOKEN + '&v=5.62',
            success: function(res) {
                //console.log(res);
                for (var i = 0; i < res.response.items.length; i++) {
                    setTimeout(checkIfShouldSendAMsg, 1000 * i, res.response.items[i], msg);
                }
            }
        });
    }

    function checkIfShouldSendAMsg(id, msg) {
        $.ajax({
            dataType: 'jsonp',
            method: 'GET',
            url: 'https://api.vk.com/method/messages.getHistory?user_id=' 
                            + id + '&access_token=' + TOKEN + '&v=5.62',
            success: function(res) {
                //console.log(res);
                if (res.response.count == 0) {
                    sendMsg(id, msg);
                }
            }
        });
    }

    function sendMsg(id, msg) {
        var report = $("#report");
        $.ajax({
            dataType: 'jsonp',
            method: 'GET',
            url: 'https://api.vk.com/method/messages.send?user_id=' 
                            + id + '&message=' + msg + '&access_token=' + TOKEN + '&v=5.62',
            success: function(res) {
                console.log(res);
                //report.append(res.response + '<br>');
            }
        });
    }

    function getName() {
        $.ajax({
            dataType: 'jsonp',
            method: 'GET',
            url: 'https://api.vk.com/method/account.getProfileInfo?&access_token=' + TOKEN + '&v=5.62',
            success: function(res) {
                console.log(res);
                $('#name').html(res.response.first_name + " " + res.response.last_name);
                $('#login').hide();
                $('#token').hide();
                displayAllGroups();
            }
        });
    }

    function displayAllGroups() {
        $('#groups').html("");
        $.ajax({
            dataType: 'jsonp',
            method: 'GET',
            url: 'https://api.vk.com/method/groups.get?&access_token=' + TOKEN + '&v=5.62&extended=1&fields=can_post',
            success: function(res) {
                console.log(res);
                for (var i = 0; i < res.response.count; i++) {
                    var group = res.response.items[i];
                    var color = "";
                    if (group.can_post == 1) {
                        color = "green";
                    } 
                    var image = "<a target='_blank' href ='https://vk.com/" + group.screen_name + "'" + "><img src=" + group.photo_50 + "></a>";
                    var item = "<div class = 'group "+ color + "'> <div class ='group_name'>" + image + group.name 
                            + "</div> <div class = 'options'> <input type='checkbox' value = '"+group.id+"'/></div> </div>";
                    $('#groups').append(item);
                }

                //$('#name').append(res.response.first_name + " " + res.response.last_name);
                //report.append(res.response + '<br>');
            }
        });
    }

});








