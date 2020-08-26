
$('document').ready(function() {
    var TOKEN = "";

    var MAX = 10e9;

    var checkedFlag = true;

    var DEFAULT_DELAY = 1

    $('.go').submit(function(e) {
        e.preventDefault();
        var msg = $('#msg').val();
        var photo = $('#photo').val();

        $('#goBtn').hide();

        var delay = $("#delay").val();
        if (delay == "") {
            delay = DEFAULT_DELAY;
        }

        var interval = 0;
        var groups = $('#groups').find("input");
        for (var i = 0; i < groups.length; i++) {
            if (groups[i].checked) {
                interval++;
                setTimeout(post, 1000 * delay * interval, groups[i], msg, photo);
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

    $('#joinGroups').click(function(e) {
        e.preventDefault();

        $('#joinGroups').hide();

        var delay = $("#delay").val();
        if (delay == "") {
            delay = DEFAULT_DELAY;
        }

        var interval = 0;
        var groups = $('#groups').find("input");
        for (var i = 0; i < groups.length; i++) {
            if (groups[i].checked) {
                interval++;
                setTimeout(join, 1000 * delay * interval, groups[i]);
            }
        }

        setTimeout(function() {
            $('#joinGroups').show();
        }, 1000);

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

    $('#goSearch').click(function(e) {
        var search = $('#search').val();
        $.ajax({
            dataType: 'jsonp',
            method: 'GET',
            url: 'https://api.vk.com/method/groups.search?&access_token=' + TOKEN + '&v=5.62&count=1000&q=' + search,
            success: function(res) {
                var part1 = getGroupsById(getGroupsId(res, 0, 400));
                var part2 = getGroupsById(getGroupsId(res, 400, 800));

                $.when(part1, part2).done(function(x1, x2) {
                    console.log(x1, x2);
                    res = x1[0].response.concat(x2[0].response);
                    displayGroupsSearch(res);
                });
            }
        });
    });

    function getGroupsById(groups) {
        return $.ajax({
            dataType: 'jsonp',
            method: 'GET',
            url: 'https://api.vk.com/method/groups.getById?&access_token=' + TOKEN 
                + '&v=5.103&fields=can_post,members_count,city,wall&group_ids=' + groups
        });
    }

    function getGroupsId(groups, from, to) {
        var ids = "";
        for (var i = from; i < to; i++) {
            ids += groups.response.items[i].id;
            if (i < to - 1) {
                ids += ",";
            }
        }
        return ids;
    }

    function join(inputBox) {
        var id = $(inputBox).val();
        $.ajax({
            dataType: 'jsonp',
            method: 'GET',
            url: 'https://api.vk.com/method/groups.join?group_id=' + id + '&access_token=' + TOKEN + '&v=5.62', 
            success: function(res) {
                console.log(res);
                $(inputBox).parent().css("background-color","green");
                setTimeout(function() {
                    $(inputBox).parent().css("background-color","initial");
                }, 5000);
            }
        });
    };

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

    function displayGroupsSearch(res) {
        res.sort(function(a, b) {
            return b.members_count - a.members_count;
        });

        var members = $("#members").val();
        if (members == "") {
            members = MAX;
        }

        $('#groups').html("");
        var table = "<table border='1'><tr><th></th><th>Название</th><th>Кол-во участников</th><th>Город</th><th>Тип</th><th>Стена</th><th></th></tr>"

        for (var i = 0; i < res.length; i++) {
            var group = res[i];

            if (group.members_count < members) {
                break;
            }

            console.log(group);
            var color = "";
            if (group.can_post == 1) {
                color = "green";
            } 
            var openness = group.is_closed === 0 ? "Открытое" : "Закрытое";
            var page_group = group.type === "page" ? "Страница" : "Группа";
            var city = group.city === undefined ? "" : group.city.title;
            var wall = group.wall === 0 ? "Выключена" : group.wall === 1 ? 
                    "Открытая" : group.wall === 2 ? "Ограниченная" : "Закрытая";

            var image = "<a target='_blank' href ='https://vk.com/" + group.screen_name + "'" + "><img src=" + group.photo_50 + "></a>";

            var row = "<tr class = 'group "+ color + "'>" +
                "<td>" + image + "</td>" +
                "<td>" + group.name + "</td>" + 
                "<td>" + group.members_count + "</td>" + 
                "<td>" + city + "</td>" + 
                "<td>" + page_group + " / " + openness +  "</td>" +
                "<td>" + wall +  "</td>" + 
                "<td><input type='checkbox' value = '" + group.id + "'/></td>" + 
                
            "</tr>"

            table += row;
        }

        $('#groups').append(table + "</table>");
    }

    function displayGroups(res) {
        $('#groups').html("");
        var table = "<table border='1'><tr><th></th><th>Название</th><th>Кол-во участников</th><th>Город</th><th>Тип</th><th>Стена</th><th></th></tr>"

        for (var i = 0; i < res.response.count; i++) {
            var group = res.response.items[i];
            console.log(group);
            var color = "";
            if (group.can_post == 1) {
                color = "green";
            } 
            var openness = group.is_closed === 0 ? "Открытое" : "Закрытое";
            var page_group = group.type === "page" ? "Страница" : "Группа";
            var city = group.city === undefined ? "" : group.city.title;
            var wall = group.wall === 0 ? "Выключена" : group.wall === 1 ? 
                    "Открытая" : group.wall === 2 ? "Ограниченная" : "Закрытая";

            var image = "<a target='_blank' href ='https://vk.com/" + group.screen_name + "'" + "><img src=" + group.photo_50 + "></a>";

            var row = "<tr class = 'group "+ color + "'>" +
                "<td>" + image + "</td>" +
                "<td>" + group.name + "</td>" + 
                "<td>" + group.members_count + "</td>" + 
                "<td>" + city + "</td>" + 
                "<td>" + page_group + " / " + openness +  "</td>" + 
                "<td>" + wall +  "</td>" + 
                "<td><input type='checkbox' value = '" + group.id + "'/></td>" + 
                
            "</tr>"

            table += row;
        }

        $('#groups').append(table + "</table>");
    }

    function displayAllGroups() {
        $.ajax({
            dataType: 'jsonp',
            method: 'GET',
            url: 'https://api.vk.com/method/groups.get?&access_token=' + TOKEN 
                + '&v=5.103&extended=1&fields=can_post,members_count,city,wall',
            success: function(res) {
                displayGroups(res);
            }
        });
    }

});








