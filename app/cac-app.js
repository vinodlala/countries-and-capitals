'use strict';

angular.module('cacApp', ['ngRoute', 'ngAnimate'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/', {
                templateUrl: './home.html'
            })
            .when('/countries', {
                templateUrl: './countries.html',
                controller: 'countriesCtrl'
            })
            .when('/countries/:country', {
                templateUrl: './country.html',
                controller: 'countryCtrl'
            })
            .when('/error', {
                templateUrl: './error.html'
            })
            .otherwise('/error', {
                templateUrl: './error.html'
            })
        ;
    }])

    .run(function ($rootScope, $location, $timeout) {
        $rootScope.$on('$routeChangeError', function () {
            $location.path("/error");
        });
        $rootScope.$on('$routeChangeStart', function () {
            $rootScope.isLoading = true;
        });
        $rootScope.$on('$routeChangeSuccess', function () {
            $timeout(function () {
                $rootScope.isLoading = false;
            }, 1000);
        });
    })

    .constant('API_PREFIX', 'http://api.geonames.org')

    .constant('LIST_COUNTRIES', '/countryInfoJSON?')
    .constant('NEIGHBOURS', '/neighboursJSON?')
    .constant('SEARCH', '/searchJSON?')

    .constant('USER_NAME', 'username=vinod_lala')
    .constant('COUNTRY', 'country=')

    .factory('countryInfo', ['$location', '$http', 'API_PREFIX', 'LIST_COUNTRIES', 'USER_NAME',
        function ($location, $http, API_PREFIX, LIST_COUNTRIES, USER_NAME) {
            var countries = [];
            var countryResult = {};
            //var path = 'http://api.geonames.org/countryInfoJSON?username=vinod_lala';
            //var path = API_PREFIX + '/countryInfoJSON?username=vinod_lala';
            var path = API_PREFIX + LIST_COUNTRIES + USER_NAME;
            var i;
            $http.get(path, {cache: true})
                .success(function (data) {
                    for (i = 0; i < data.geonames.length; i++) {
                        countries[i] = data.geonames[i];
                    }
                })
                .error(function (data, status) {
                    console.log('Error status: ' + status);
                    $location.path('/error');
                });

            function getCountries() {
                return countries;
            }

            function getCountry(countryName) {
                // has to be a better way to search through array
                for (i = 0; i < countries.length; i++) {
                    if (countries[i].countryName === countryName) {
                        countryResult = countries[i];
                        break;
                    }
                }
                return countryResult;
            }

            return {
                getCountries: getCountries,
                getCountry: getCountry
            };
        }])


    //.factory('capitalPopInfo', ['countryInfo', 'countryNeighbor', '$http', '$location', function (countryInfo, countryNeighbor, $http, $location) {
    .factory('capitalPopInfo', ['countryInfo', 'countryNeighbors', '$http', '$location', function (countryInfo, countryNeighbors, $http, $location) {
        var popResult = {};

        var getCapPopInfo = function (counCode, capName, countryName) {
            var resultTemp = countryInfo.getCountry(countryName);
            //var neighbor = countryNeighbor.getNeighbor(countryName);
            var neighbors = countryNeighbors.getNeighbors(countryName);

            var path = 'http://api.geonames.org/searchJSON?';
            var request = {
                q: capName,
                country: counCode, // two-character country code
                fcode: 'pplc', //capital of a political entity
                //featurecode: 'pplc', //capital of a political entity
                username: 'vinod_lala'
            };

            $http({
                method: 'GET',
                url: path,
                cache: true,
                params: request
            })
                .success(function (data) {

                    if (capName) {
                        popResult.counName = data.geonames[0].countryName;
                        popResult.capPop = data.geonames[0].population;
                        popResult.cap = capName;
                    } else {
                        popResult.counName = countryName;
                        popResult.capPop = 0;
                        popResult.cap = 'N/A';
                    }
                })
                .error(function () {
                    console.log('Error status: ' + status);
                    $location.path('/error');
                });


            popResult.counPop = resultTemp.population;
            popResult.counArea = resultTemp.areaInSqKm;
            //popResult.counNeighbor = neighbor;
            popResult.counNeighbors = neighbors;
            popResult.counCode = counCode;


            return popResult;

        };


        return {
            getCapPopInfo: getCapPopInfo
        };

    }])










    //.factory('capitalPopInfo', ['countryInfo', 'countryNeighbor', '$http', '$location', function (countryInfo, countryNeighbor, $http, $location) {
    .factory('capitalPopulation', ['countryInfo', 'countryNeighbors', '$http', '$location', function (countryInfo, countryNeighbors, $http, $location) {
        //var popResult = {};
        //var popResult = 0;

        //var getCapitalPopulation = function (counCode, capName, countryName) {
        var getCapitalPopulation = function (countryCode, capital) {

            debugger;
            var popResult = 0;

            //var resultTemp = countryInfo.getCountry(countryName);
            //var neighbor = countryNeighbor.getNeighbor(countryName);
            //var neighbors = countryNeighbors.getNeighbors(countryName);

            var path = 'http://api.geonames.org/searchJSON?';
            var request = {
                //q: capName,
                q: capital,
                //country: counCode, // two-character country code
                country: countryCode, // two-character country code
                fcode: 'pplc', //capital of a political entity
                //featurecode: 'pplc', //capital of a political entity
                username: 'vinod_lala'
            };

            $http({
                method: 'GET',
                url: path,
                cache: true,
                params: request
            })
                .success(function (data) {
                    debugger;

                    if (capital) {
                        //popResult.counName = data.geonames[0].countryName;
                        //popResult.capPop = data.geonames[0].population;
                        debugger;
                        popResult = data.geonames[0].population;
                        debugger;
                        //popResult.cap = capName;
                    } else {
                        //popResult.counName = countryName;
                        //popResult.capPop = 0;
                        debugger;
                        popResult = 0;
                        debugger;
                        //popResult.cap = 'N/A';
                    }
                })
                .error(function () {
                    console.log('Error status: ' + status);
                    $location.path('/error');
                });

            debugger;
            //popResult.counPop = resultTemp.population;
            //popResult = resultTemp.population;
            //popResult.counArea = resultTemp.areaInSqKm;
            //popResult.counNeighbor = neighbor;
            //popResult.counNeighbors = neighbors;
            //popResult.counCode = counCode;

            debugger;
            return popResult;

        };


        return {
            //getCapPopInfo: getCapPopInfo
            getCapitalPopulation: getCapitalPopulation
        };

    }])








    //.factory('countryNeighbor', ['$http', 'countryInfo', '$location', function ($http, countryInfo, $location) {
    .factory('countryNeighbors', ['$http', 'countryInfo', '$location', function ($http, countryInfo, $location) {
        var i;

        debugger;
        //var getNeighbor = function (countryName) {
        var getNeighbors = function (countryName) {
            debugger;
            //var neighborResult = [];
            var neighbors = [];
            var geoId = countryInfo.getCountry(countryName).geonameId;
            //debugger;

            var path = 'http://api.geonames.org/neighboursJSON?';
            var request = {
                geonameId: geoId,
                country: countryName,
                username: 'vinod_lala'
            };

            if (countryName == 'Antarctica') {
                //neighborResult = [];
                neighbors = [];
            } else {
                $http({
                    method: 'GET',
                    url: path,
                    cache: true,
                    params: request
                })
                    .success(function (data) {
                        //debugger;
                        if (data.geonames.length === 0) {
                            //neighborResult = [];
                            neighbors = [];
                        } else {
                            for (i = 0; i < data.geonames.length; i++) {
                                //if (data.geonames.length >= 3) {
                                //    neighborResult[0] = data.geonames[0].countryName;
                                //    neighborResult[1] = data.geonames[1].countryName;
                                //    neighborResult[2] = data.geonames[2].countryName;
                                //    break;
                                //} else {
                                //    neighborResult[i] = data.geonames[i].countryName;
                                //}
                                debugger;
                                neighbors[i] = data.geonames[i].countryName;
                            }
                        }

                    })
                    .error(function (data, status) {
                        console.log('Error status: ' + status);
                        $location.path('/error');
                    });

            }

            //return neighborResult;
            debugger;
            return neighbors;
            debugger;
        };


        return {
            //getNeighbor: getNeighbor
            getNeighbors: getNeighbors
        };

    }])

    .controller('countriesCtrl', ['countryInfo', '$scope', '$location', '$rootScope', '$timeout',
        function (countryInfo, $scope, $location, $rootScope, $timeout) {
            $scope.countries = countryInfo.getCountries();
            $scope.goToCountry = function (countryName) {
                $location.path('/countries/' + countryName);
            }
        }])

    //.controller('countryCtrl', ['$scope', 'countryInfo', 'capitalPopInfo', 'countryNeighbor', '$routeParams',
    .controller('countryCtrl', ['$scope', 'countryInfo', 'capitalPopInfo', 'countryNeighbors', 'capitalPopulation', '$routeParams',
        function ($scope, countryInfo, capitalPopInfo, countryNeighbors, capitalPopulation, $routeParams) {

            //var countryCodeShow = countryInfo.getCountry($routeParams.country).countryCode;
            //var capitalShow = countryInfo.getCountry($routeParams.country).capital || '';
            //var countryNameShow = countryInfo.getCountry($routeParams.country).countryName;

            //$scope.detailShow = capitalPopInfo.getCapPopInfo(countryCodeShow, capitalShow, countryNameShow);



            //debugger;
            //var country = countryInfo.getCountry($routeParams.country);
            var country = countryInfo.getCountry($routeParams.country);
            var countryCodeShow2 = country.countryCode;
            var capitalShow2 = country.capital || '';
            var countryNameShow2 = country.countryName;
            //$scope.countryDetails = {};

            //$scope.country = capitalPopInfo.getCapPopInfo(countryCodeShow2, capitalShow2, countryNameShow2);
            $scope.country = country;
            //debugger;
            //$scope.country.neighbors = countryNeighbors.getNeighbors(country.countryName);
            $scope.country.neighbors = countryNeighbors.getNeighbors(country.countryName);
            debugger;
            $scope.country.capitalPopulation = capitalPopulation.getCapitalPopulation(country.countryCode, country.capital);
            debugger;
            //$scope.detailShow = capitalPopInfo.getCapPopInfo(countryCodeShow2, capitalShow2, countryNameShow2);


        }])
;