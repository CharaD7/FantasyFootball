/// <reference path="knockout-3.3.0.js" />
/// <reference path="jquery-2.1.4.js" />
/// <reference path="jquery.signalR-2.2.0.js" />
/// <reference path="knockout.mapping-latest.debug.js" />

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
		player.team(self.name());
		player.teamId(self.id());
		self.players.unshift(player);
		self.resetRosterPositions();

		self.totalLeft(self.totalLeft() - player.auctionAmount());
		self.maxBid(self.totalLeft() - (16 - self.players().length) + 1);
	}

	self.removePlayer = function (player) {
		self.players.remove(function (currentPlayer) { return currentPlayer.id() == player.id();});
		self.resetRosterPositions();

		self.totalLeft(self.totalLeft() + player.auctionAmount());
		self.maxBid(self.totalLeft() - (16 - self.players().length) + 1);
	}

	self.resetRosterPositions = function () {
		self.rosterPositions().forEach(function (rosterPosition) {
			rosterPosition.number(0);
			self.players().forEach(function (player) {
				if (player.position() == rosterPosition.position()) {
					rosterPosition.number(rosterPosition.number() + 1);
				}
			});
		});
	};

	self.totalLeft = ko.observable(100);
	self.maxBid = ko.observable(0);
};

function Player(data) {
	var self = this;

	if (!data) data = { id: 0, fullName: '', nflTeam: '', position: '', auctionAmount: 0, team: '', teamId: 0 };
	self.id = ko.observable(data.id);
	self.fullName = ko.observable(data.fullName);
	self.nflTeam = ko.observable(data.nflTeam);
	self.position = ko.observable(data.position);
	self.auctionAmount = ko.observable(data.auctionAmount);
	self.teamId = ko.observable(data.teamId);
	self.team = ko.observable(data.team);
}

function NflTeam(data) {
	var self = this;
	self.id = ko.observable(data.id);
	self.name = ko.observable(data.name);
}

function AppViewModel() {
	var self = this;

	self.teams = ko.observableArray([]);
	self.nflTeams = ko.observableArray([]);
	self.recentlyAuctionedPlayers = ko.observableArray([]);
	self.auctionOrder = ko.observableArray([]);

	self.rosterPositions = ko.observableArray([
		new RosterPosition('QB', 1),
		new RosterPosition('RB', 2),
		new RosterPosition('WR', 3),
		new RosterPosition('TE', 1),
		new RosterPosition('K', 1),
		new RosterPosition('D', 1),
	]);

	self.currentTeam = ko.observable();

	self.displayTeam = function (team) {
		self.currentTeam(team);
	}

	self.currentPlayer = ko.observable(new Player(null));
	self.originalPlayer = ko.observable(new Player(null));
	self.isNewPlayer = ko.observable(true);

	self.resetPlayer = function () {
		self.currentPlayer(new Player(null));
		self.originalPlayer(new Player(null));
		self.isNewPlayer(true);
	}

	self.handlePlayer = function () {
		if (self.isNewPlayer()) self.auctionPlayer();
		else self.updatePlayer();
	}

	self.auctionPlayer = function () {
		$playerHub.server.auctionPlayer(ko.toJS(self.currentPlayer)).fail(function (error) { alert(error) });
	}

	self.auctionedPlayer = function (player) {
		self.resetPlayer();
		player = new Player(player);
		var team;
		self.teams().forEach(function (tempTeam) {
			if (tempTeam.id() == player.teamId()) {
				team = tempTeam;
			}
		});
		team.addPlayer(player);

		self.recentlyAuctionedPlayers.unshift(player);
		if (self.recentlyAuctionedPlayers().length > 3) self.recentlyAuctionedPlayers.pop();

		self.auctionOrder.unshift(self.auctionOrder.pop());
	}


	self.displayPlayer = function (player) {
		self.originalPlayer(player);
		self.currentPlayer(new Player(ko.toJS(player)));
		self.isNewPlayer(false);
	}

	self.updatePlayer = function () {
		$playerHub.server.updatePlayer(ko.toJS(self.currentPlayer), self.originalPlayer().teamId);
	}

	self.playerUpdated = function (player, originalTeamId) {
		self.resetPlayer();
		player = new Player(player);
		self.recentlyAuctionedPlayers().forEach(function (recentPlayer) {
			if (recentPlayer.id == player.id()) {
				self.recentlyAuctionedPlayers.replace(recentPlayer, player);
			}
		})
		self.teams().forEach(function (team) {
			if (team.id() == originalTeamId) {
				team.removePlayer(player);
			} else if (team.id() == player.teamId()) {
				team.addPlayer(player);
			}
		});
	}
}

var appViewModel = new AppViewModel();
ko.applyBindings(appViewModel);

var $playerHub;
$(function () {
	$.getJSON('/api/Teams/', function (teams) {
		var mappedTeams = $.map(teams, function (team) { return new Team(team); });
		appViewModel.teams(mappedTeams);

		appViewModel.auctionOrder(mappedTeams);

		$.getJSON('/api/Teams/Players', function (playerTeams) {
			playerTeams.forEach(function (team) {
				var players = team.players;
				appViewModel.teams().forEach(function (tempTeam) {
					if (tempTeam.id() == team.id) {
						team = tempTeam;
					}
				});
				players.forEach(function (player) {
					team.addPlayer(new Player(player));
				});
			});
		});
	});

	$.getJSON('/api/NflTeams/', function (nflTeams) {
		var mappedNflTeams = $.map(nflTeams, function (nflTeam) { return new NflTeam(nflTeam); });
		appViewModel.nflTeams(mappedNflTeams);
	})

	$.getJSON('/api/Players', function (players) {
		var mappedPlayers = $.map(players, function (player) { return new Player(player) });
		appViewModel.recentlyAuctionedPlayers(players);
	})
	
	//load hub
	$playerHub = $.connection.playerHub;
	$playerHub.client.playerAuctioned = appViewModel.auctionedPlayer;
	$playerHub.client.playerUpdated = appViewModel.playerUpdated;

	$.connection.hub.logging = true;
	$.connection.hub.start().done(function () {
	});
});