/**
 * Created by sander.struijk on 03.07.14.
 */
'use strict';

app.directive('host', function (hostManager, toolkit) {
    return {
        restrict: "E",
        replace: true,
        templateUrl: '../../views/partials/host.html',
        controller: function ($scope, $element, $attrs) {

            var host = $scope.host;

            $scope.removeHost = function () {
                // The last item in the host list should always be an empty item
                // which is used to add new hosts, so we don't want to remove that one.
                if (host.isLast() && host.isBlank()) return;
                host.delete();
            };

            function _prevBlankHosts(host) {
                var blankHosts = [];

                function __prevBlankHosts(host) {
                    if (host && host.isBlank()) {
                        blankHosts.push(host);
                        __prevBlankHosts(host.prevHost());
                    }
                }

                __prevBlankHosts(host.prevHost());
                return blankHosts;
            }

            function _nextBlankHosts(host) {
                var blankHosts = [];

                function __nextBlankHosts(host) {
                    if (host && host.isBlank()) {
                        blankHosts.push(host);
                        __nextBlankHosts(host.nextHost());
                    }
                }

                __nextBlankHosts(host.nextHost());
                return blankHosts;
            }

            function _processHost(host) {
                var message = 'Host.id: ' + host.id;

                if (host.isSingle()) {
                    message += ' is the only host in the list';
                    if (!host.isBlank()) {
                        message += ' and it is not blank, therefore we add a new and blank host to the bottom of the list.';
                        hostManager.newHost();
                    }
                }
                else if (host.isFirst()) {
                    message += ' is the first host in the list.';
                    if (host.isBlank()) {
                        message += ' and it is blank.';
                        var blankHosts = _nextBlankHosts(host);
                        blankHosts.forEach(function (blankHost) {
                            message += ' next sibling is also blank, removing next sibling host...';
                            blankHost.delete();
                        });
                    }
                }
                else if (host.isLast()) {
                    message += ' is the last host in the list';
                    if (host.isBlank()) {
                        message += ' and it is blank.'
                        var blankHosts = _prevBlankHosts(host);
                        blankHosts.forEach(function (blankHost) {
                            message += ' previous sibling is also blank, removing previous sibling host...';
                            blankHost.delete();
                        });
                    } else {
                        message += ' and it is not blank, therefore we add a new and blank host to the bottom of the list.';
                        hostManager.newHost();
                    }
                }
                else if (host.isBlank()) {
                    message += ' is blank.';
                    var blankHosts = _nextBlankHosts(host);
                    if (_.last(blankHosts).index() === hostManager.lastIndex())
                        blankHosts.forEach(function (blankHost) {
                            message += ' next sibling is also blank, removing next sibling host...';
                            blankHost.delete();
                        });
                }

                message += ' Saving host...';
                host.save();
                console.log(message);
            }

            var _save = function (n, o) {
                if (n === o) return;
                if (host.first) {
                    host.first = false;
                    return;
                }
                toolkit.delayAction('host', function () {
                    _processHost(host);
                }, 500);
            };

            $scope.$watch('host.alias', _save);
            $scope.$watch('host.username', _save);
            $scope.$watch('host.host', _save);
            $scope.$watch('host.port', _save);

        }
    };
});