'use strict';

function checkNeighbors(queue, visited, friendNameToFriendObj) {
    var node = queue[0];
    queue = queue.slice(1);
    var neighbors = node.friends.sort();
    for (var i = 0; i < neighbors.length; i++) {
        if (neighbors[i] in visited) {
            continue;
        }
        visited[neighbors[i]] = visited[node.name] + 1;
        queue.push(friendNameToFriendObj[neighbors[i]]);
    }

    return queue;
}

function bfs(queue, visited, friendNameToFriendObj) {
    while (queue.length > 0) {
        queue = checkNeighbors(queue, visited, friendNameToFriendObj);
    }

    return visited;
}

function searchWaves(friends) {
    var visited = {};
    var queue = friends.filter(function (friend) {
        return friend.hasOwnProperty('best');
    });
    var friendNameToFriendObj = {};
    friends.forEach(function (friendObj) {
        friendNameToFriendObj[friendObj.name] = friendObj;
    });
    queue.forEach(function (friend) {
        visited[friend.name] = 1;
    });

    return bfs(queue, visited, friendNameToFriendObj);
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    if (!(filter instanceof Filter)) {
        throw new TypeError();
    }

    this.getWavesFriends = function (wavesLimit) {

        //  console.info('\n');
        var copyFriends = friends.slice().sort(function (friend1, friend2) {
            if (friend1.hasOwnProperty('best') && friend2.hasOwnProperty('best') ||
                !friend1.hasOwnProperty('best') && !friend2.hasOwnProperty('best')) {
                return friend1.name < friend2.name ? -1 : 1;
            }

            return friend1.hasOwnProperty('best') ? -1 : 1;
        });
        var visited = searchWaves(copyFriends);

        //  console.info(visited);
        var filteredFriends = Object.keys(visited);
        var friendObj;
        filteredFriends = filteredFriends.map(function (friendName) {
            copyFriends.forEach(function (friend) {
                if (friend.name === friendName) {
                    friendObj = [friend, visited[friendName]];
                }
            });

            return friendObj;
        }).filter(filter.filter);
        var limitedFriends = [];
        if (wavesLimit === undefined) {
            wavesLimit = filteredFriends[filteredFriends.length - 1][1];
        }

        //  console.info(filteredFriends);
        filteredFriends.forEach(function (friend) {
            if (friend[1] <= wavesLimit) {
                limitedFriends.push(friend[0]);
            }
        });

        return limitedFriends;
    };

    this.filteredFriends = this.getWavesFriends();
    this.currentFriend = 0;

    this.done = function () {
        return this.currentFriend === this.filteredFriends.length;
    };

    this.next = function () {
        if (this.done()) {
            return null;
        }
        this.currentFriend++;

        return this.filteredFriends[this.currentFriend - 1];
    };
}

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    Iterator.call(this, friends, filter);
    this.filteredFriends = this.getWavesFriends(maxLevel);
}

LimitedIterator.prototype = Object.create(Iterator.prototype);
LimitedIterator.prototype.constructor = LimitedIterator;

/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    console.info('Filter');

    this.filter = function () {
        return true;
    };
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    console.info('MaleFilter');

    this.filter = function (friend) {
        return friend[0].gender === 'male';
    };
}

MaleFilter.prototype = Object.create(Filter.prototype);
MaleFilter.prototype.constructor = MaleFilter;

/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    console.info('FemaleFilter');

    this.filter = function (friend) {
        return friend[0].gender === 'female';
    };
}

FemaleFilter.prototype = Object.create(Filter.prototype);
FemaleFilter.prototype.constructor = FemaleFilter;

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;
