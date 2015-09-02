/// <reference path="knockout-3.3.0.js" />
/// <reference path="jquery-2.1.4.js" />

function rosterPosition(position, minNumber) {
	var self = this;
	self.position = ko.observable(position);
	self.number = ko.observable(0);
	self.minNumber = ko.observable(minNumber);
}

function team(id, owner, name) {
	var self = this;
	self.id = ko.observable(id);
	self.owner = ko.observable(owner);
	self.name = ko.observable(name);
	self.players = ko.observableArray([]);
	self.rosterPositions = ko.observableArray([
		new rosterPosition('QB', 1),
		new rosterPosition('RB', 2),
		new rosterPosition('WR', 3),
		new rosterPosition('TE', 1),
		new rosterPosition('K', 1),
		new rosterPosition('D', 1),
	]);

	self.addPlayer = function (player) {
		self.players.push(player);
		self.rosterPositions().forEach(function (rosterPosition) {
			if (rosterPosition.position() == player.position()) {
				rosterPosition.number(rosterPosition.number() + 1);
			}
		})
	}

	self.totalLeft = ko.pureComputed(function () {
		var totalBid = 0;
		self.players().forEach(function (player) {
			totalBid += player.auctionAmount();
		});
		return (100 - totalBid);
	});

	self.maxBid = ko.pureComputed(function () { return self.totalLeft() - (16 - self.players().length) + 1 });
};

function player(id, firstName, lastName, nflTeam, position, auctionAmount) {
	var self = this;
	self.id = ko.observable(id);
	self.firstName = ko.observable(firstName);
	self.lastName = ko.observable(lastName);
	self.fullName = ko.computed(function () { return this.firstName + ' ' + this.lastName }, self);
	self.nflTeam = ko.observable(nflTeam);
	self.position = ko.observable(position);
	self.auctionAmount = ko.observable(auctionAmount);
}

function AppViewModel() {
	var self = this;

	var bni = new team(1, 'jersey', '*Backfield Not Included');
	bni.addPlayer(new player(1, 'Phillip', 'Rivers', 'Chargers', 'QB', 20));
	self.teams = ko.observableArray([
		bni,
		new team(2, 'Brennan', 'Pistol Shrimp All-Stars')
	]);
}

var appViewModel = new AppViewModel();
ko.applyBindings(appViewModel);
appViewModel.teams()[0].addPlayer(new player(2, 'Eli', 'Manning', 'Giants', 'QB', 10));
appViewModel.teams()[0].addPlayer(new player(3, 'Sam', 'Bradford', 'Eagles', 'QB', 5));