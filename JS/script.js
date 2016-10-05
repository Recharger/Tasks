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
        $(".contributors").on("click", ".contributor-item", function () {
            parseUserData({
                login: $(this).find("h3").html(),
                downloaded: {}
            });
        });
        $(".register-fields").validate();
        $(".modal").on("hidden.bs.modal", function () {
            $(".modal-body, .modal-title").empty();
        });
        $('.register').on('click', function () {
            $('.contributors, .tools').hide();
            $('.register-form').fadeIn();
        });
        $('.return-button').on('click', function () {
            backWithClear();
        });
        $('.submit-button').on('click', function () {
            getFieldsFromRegisterForm();
            backWithClear();
            new PNotify({
                type: 'success',
                title: 'Hooray!',
                text: 'New contributor added'
            });
        });
        $('.clear-local-storage').on('click', function () {
            localStorage.clear();
        });
        backWithClear();
        $('.register-fields').on('change', function () {
            if($('.register-fields').valid()) {
                $('.submit-button').removeAttr('disabled');
            } else {
                $('.submit-button').attr('disabled','disabled');
            }
        });
    });

    $('.upload_widget_opener').cloudinary_upload_widget(
        { cloud_name: 'dbxudcjdq', upload_preset: 'wanb71fe', folder: 'user_photos', multiple: false },
        function(error, result) {
            if(error != undefined) return new PNotify({
                type: 'warning',
                title: 'Attention!',
                text: 'Picture is not choosed'
            });
            $('.avatar-url').val('http://res.cloudinary.com/dbxudcjdq/image/upload/w_300,h_300,c_fill,g_face/' + result[0].public_id + '.png');
        });

    $('.register-fields').validate({
        ignore: [],
        rules: {
            login: {
                minlength: 2,
                maxlength: 60,
                required: true
            },
            name: {
                minlength: 2,
                maxlength: 60,
                required: true
            },
            company: {
                minlength: 5,
                maxlength: 60,
                required: true
            },
            blog: {
                minlength: 3,
                maxlength: 60,
                url: true,
                required: true
            },
            avatar_url: {
                minlength: 1,
                required: true
            },
            email: {
                minlength: 6,
                maxlength: 60,
                email: true,
                required: true
            },
            location: {
                minlength: 2,
                maxlength: 60,
                required: true
            },
            level: {
                required: true
            },
            contributions: {
                required: true
            },
            technology: {
                minlength: 1,
                required: true
            }
        },
        highlight: function (element) {
            $(element).closest('.form-group').removeClass('has-success').addClass('has-error');
        },
        success: function (label, element) {
            $(element).closest('.form-group').removeClass('has-error').addClass('has-success');
            $(element).parent().find('span').remove();
        },
        errorPlacement: function (error, element) {
            element.parent().find('span').remove();
            element.parent().append('<span class="help-block">' + error.text() + '</span>');
        }
    });

    function getFieldsFromRegisterForm() {
        var contributor = {};
        $('.register-form').find('input').each(function () {
            contributor[$(this).attr('name')] = $(this).val();
        });
        contributor.isLocalSaved = true;
        localStorage.setItem(contributor.login, JSON.stringify(contributor));
        console.log(JSON.parse(localStorage.getItem(contributor.name)));
    }

    function backWithClear() {
        $('.contributors, .tools').fadeIn();
        $('.register-form').hide();
        $('.technology').parent().empty().append('<input class="technology" name="technology">');
        $('.register-form').find('input').each(function () {
            $(this).val('');
        });
        $('.technology').tagit({
            availableTags: ["c++", "java", "php", "javascript", "ruby", "python", "c"]
        });
        $('.cloudinary-thumbnails').remove();
    }

    function getContributorsList() {
        var promise = $.get("https://api.github.com/repos/thomasdavis/backbonetutorials/contributors");
        $.when(promise).done(function (data) {
            data = addLocalStorageFromContributors(data);
            sortContributorsArray(data);
            separateContributorsList(data);
            $(".sort-selector").change(function () {
                $(".contributors").empty();
                data.reverse();
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

    function addLocalStorageFromContributors(data) {
        $.each(localStorage, function (key, value) {
           data.push(JSON.parse(value));
        });
        return data;
    }

    function separateContributorsList(arrContributors) {
        arrContributors.forEach(function (userInformation) {
            setGroupStatus(userInformation);
            createContributorElement(userInformation);
        })

    }

    function createContributorElement(person) {
        var str = $('<div class="contributor-item ' + person.group + '"><img src="' + person.avatar_url + '" class="img-circle contributor">' +
        '<h3>' + person.login + '</h3><div/>');
        if(person.isLocalSaved === true) {
            str.append('<h4><span class="label label-success">Local</span></h4>');
        }
        $(".contributors").append(str);
    }

    function setGroupStatus(person) {
        if (+person.contributions > GroupLimits.gold.minValue) {
            person.group = GroupLimits.gold.name;
        }
        else if (+person.contributions > GroupLimits.silver.minValue) {
            person.group = GroupLimits.silver.name;
        }
        else {
            person.group = GroupLimits.bronze.name;
        }
    }

    function showContributorsFromType(group) {
        if (group === "all") {
            $(".contributors").children().show();
        } else {
            $(".contributors").children().hide();
            $("." + group).show();
        }
    }

    function sortContributorsArray(arr) {
            arr.sort(function (a, b) {
                if (a.login.toLowerCase() > b.login.toLowerCase()) {
                    return 1;
                }
                return -1;
            });
    }

    function parseUserData(options) {
        console.log(options);
        if(options.login in localStorage){
            $(".modal").modal("show");
            fillModalWindowFields(JSON.parse(localStorage[[options.login]]));
        } else {
            var login = options.login;
            if (!options.downloaded[login]){
                var promise = $.get("https://api.github.com/users/" + login);
                $.when(promise).done(function (data) {
                    $(".modal").modal("show");
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
                $(".modal").modal("show");
                fillModalWindowFields(options.downloaded[login]);
            }
        }
    }

    function generateModalFilling(user) {
        console.log(user);
        var filling = (user.name != undefined) ? '<p>Name: ' + capitalizeFirstLetter(user.name) + '</p>' : '';
        filling += (user.company != undefined) ? '<p>Company: ' + capitalizeFirstLetter(user.company) + '</p>' : '';
        filling += (user.blog != undefined) ? '<p>Blog: <a href="'+ user.blog +'" target="_blank">'+ user.blog +'</a></p>' : '';
        filling += (user.email != undefined) ? '<p>Email: <a href="mailto:' + user.email + '">' + user.email + '</a></p>' : '';
        filling += (user.location != undefined) ? '<p>Location: ' + user.location + "</p>" : '';
        var image = '<img src="' + user.avatar_url + '"> ';
        var failString = 'There is no information about this user';
        if (filling === '') return image + failString;
        return image + filling;
    }

    function fillModalWindowFields(user) {
        $(".modal-title").html("Information about: " + user.login);
        $(".modal-body").html(generateModalFilling(user));
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }



})();