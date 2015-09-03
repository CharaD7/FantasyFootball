/// <reference path="knockout-3.3.0.js" />
/// <reference path="jquery-2.1.4.js" />
/// <reference path="jquery.signalR-2.2.0.js" />

function RosterPosition(position, minNumber) {
	var self = this;
	self.position = ko.observable(position);
	self.number = ko.observable(0);
	self.minNumber = ko.observable(minNumber);
}

function Team(data) {
	var self = this;
	self.id = ko.observable(data.id);
	self.owner = ko.observable(data.owner);
	self.name = ko.observable(data.name);
	self.players = ko.observableArray([]);
	self.rosterPositions = ko.observableArray([
		new RosterPosition('QB', 1),
		new RosterPosition('RB', 2),
		new RosterPosition('WR', 3),
		new RosterPosition('TE', 1),
		new RosterPosition('K', 1),
		new RosterPosition('D', 1),
	]);

	self.addPlayer = function (player) {
		self.players.unshift(player);
		self.rosterPositions().forEach(function (rosterPosition) {
			if (rosterPosition.position() == player.position()) {
				rosterPosition.number(rosterPosition.number() + 1);
			}
		})
	}

	self.totalLeft = ko.pureComputed(function () {
		var totalBid = 0;
		self.players().forEach(function (player) {
			totalBid += parseInt(player.auctionAmount());
		});
		return (100 - totalBid);
	});

	self.maxBid = ko.pureComputed(function () { return self.totalLeft() - (16 - self.players().length) + 1 });
};

function Player(data) {
	var self = this;
	self.id = ko.observable(data.id);
	self.firstName = ko.observable(data.firstName);
	self.lastName = ko.observable(data.lastName);
	self.fullName = ko.observable(data.fullName);
	self.nflTeam = ko.observable(data.nflTeam);
	self.position = ko.observable(data.position);
	self.auctionAmount = ko.observable(data.auctionAmount);
}

function AppViewModel() {
	var self = this;

	self.teams = ko.observableArray([
		new Team({ id: 1, owner: 'jersey', name: '*Backfield Not Included' }),
		new Team({ id: 2, owner: 'Brennan', name: 'Pistol Shrimp All-Stars' })
	]);

	self.recentlyAuctionedPlayers = ko.observableArray([]);

	self.players = ko.observableArray([]);

	self.currentTeam = ko.observable();
	self.currentPlayer = ko.observable();
	self.currentAuctionPrice = ko.observable(0);

	self.auctionPlayer = function () {
		var player = JSON.parse(ko.toJSON(self.currentPlayer));
		var team = JSON.parse(ko.toJSON(self.currentTeam));
		player.auctionAmount = self.currentAuctionPrice();
		$playerHub.server.auctionPlayer(player, team).fail(function (error) { alert(error) });
	}

	self.auctionedPlayer = function (player, team) {
		player = new Player(player);
		self.teams().forEach(function (tempTeam) {
			if (tempTeam.id() == team.id) {
				team = tempTeam;
			}
		});
		self.recentlyAuctionedPlayers.unshift(player);
		if (self.recentlyAuctionedPlayers().length > 10) self.recentlyAuctionedPlayers.shift();
		team.addPlayer(player);
	}
}

var appViewModel = new AppViewModel();
ko.applyBindings(appViewModel);

var $playerHub;
$(function () {
	$.getJSON('/api/Players/', function (players) {
		var mappedPlayers = $.map(players, function (player) { return new Player(player) });
		appViewModel.players(mappedPlayers);
	});

	// load hub
	$playerHub = $.connection.playerHub;
	$playerHub.client.playerAuctioned = function (player, team) {
		appViewModel.auctionedPlayer(player, team);
	}
	$playerHub.client.receivedPlayers = function (players) {
		var mappedPlayers = $.map(players, function (player) { return new Player(player); });
		appViewModel.players(mappedPlayers);
	}
	$.connection.hub.logging = true;
	$.connection.hub.start().done(function () {
	});
});