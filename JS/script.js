(function () {

    var GroupLimits = {
        gold: {
            minValue: 50,
            name: 'gold'
        },
        silver: {
            minValue: 5,
            name: 'silver'
        },
        bronze: {
            name: 'bronze'
        }
    };

    $(document).ready(function () {
        getContributorsList();
        var cache = {};
        $(".contributors").on("click",".contributor-item",function () {
            parseUserData({
                login: $(this).find("h3").html(),
                downloaded: cache
            });
        });
        $(".modal").on("hidden.bs.modal",function () {
            $(".modal-body").html('');
            $(".modal-title").html('');
        });
    });

    function getContributorsList() {
        var promise = $.get("https://api.github.com/repos/thomasdavis/backbonetutorials/contributors");
        $.when(promise).done(function (data) {
            sortContributorsArray(data,$(".sort-selector").val());
            separateContributorsList(data);
            $(".sort-selector").change(function () {
                $(".contributors").html("");
                sortContributorsArray(data,$(".sort-selector").val());
                separateContributorsList(data);
                showContributorsFromType($(".contributor-type").val());

            });
            $(".contributor-type").change(function () {
                showContributorsFromType($(this).val());
            })
        }).fail(function (data) {
            new PNotify({
                type: 'error',
                title: 'OOPS!',
                text: data.statusText
            });
        });
    }

    function separateContributorsList(object) {
        object.forEach(function (userInformation) {
            setGroupStatus(userInformation);
            createContributorElement(userInformation);
        })

    }

    function createContributorElement(person) {
        $(".contributors").append('<div class="contributor-item ' + person.group + '"><img src="' + person.avatar_url + '" class="img-circle contributor">' +
            '<h3>' + person.login + '</h3><div/>');
    }

    function setGroupStatus(person) {
        if(person.contributions > GroupLimits.gold.minValue) {
            person.group = GroupLimits.gold.name;
        }
        else if(person.contributions > GroupLimits.silver.minValue) {
            person.group = GroupLimits.silver.name;
        }
        else {
            person.group = GroupLimits.bronze.name;
        }
    }

    function showContributorsFromType(group) {
        if(group === "all") {
            $(".contributors").children().show();
        } else {
            $(".contributors").children().hide();
            $("." + group).show();
        }
    }

    function sortContributorsArray(arr,sortType) {
        if(sortType == "asc") {
            arr.sort(function (a, b) {
                if (a.login.toLowerCase() > b.login.toLowerCase()) {
                    return 1;
                }
                return -1;
            });
        }
        if(sortType == "desc") {
            arr.sort(function (a, b) {
                if (a.login.toLowerCase() < b.login.toLowerCase()) {
                    return 1;
                }
                return -1;
            });
        }
    }

    function parseUserData(options) {
        var login = options.login;
        if(!options.downloaded[login]){
            var promise = $.get("https://api.github.com/users/" + login);
            $.when(promise).done(function (data) {
                $("#myModal").modal("show");
                options.downloaded[login] = data;
                fillModalWindowFields(data);
            }).fail(function (data) {
                new PNotify({
                    type: 'error',
                    title: 'OOPS!',
                    text: data.statusText
                });
            });
        } else {
            $("#myModal").modal("show");
            fillModalWindowFields(options.downloaded[login]);
        }



    }

    function fillModalWindowFields(user) {
        $(".modal-title").html("Information about: " + user.login);
        var name = (user.name) ? '<p>Name: ' + capitalizeFirstLetter(user.name) + '</p>' : '';
        var company = (user.company) ? '<p>Company: ' + capitalizeFirstLetter(user.company) + '</p>' : '';
        var blog = (user.blog) ? '<p>Blog: <a href="'+ user.blog +'" target="_blank">'+ user.blog +'</a></p>' : '';
        var email = (user.email) ? '<p>Email: <a href="mailto:' + user.email + '">' + user.email + '</a></p>' : '';
        var location = (user.location) ? '<p>Location: ' + user.location + "</p>" : '';

        $(".modal-body").html('<img src="' + user.avatar_url + '"> ' +
            ((name || company || blog || email || location)?
                name + company + blog + email + location
                    : '<h2>There is no information about this user</h2>'));
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }



})();