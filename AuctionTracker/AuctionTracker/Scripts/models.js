///// <reference path="knockout-3.3.0.js" />

function team(id, owner, name) {
	var self = this;
	self.id = ko.observable(id);
	self.owner = ko.observable(owner);
	self.name = ko.observable(name);
	self.players = ko.observableArray([]);
	self.totalLeft = ko.computed(function() {
		var totalBid = 0;
		alert(this.players().length);
		this.players().forEach(function (player) {
			totalBid += player.auctionAmount();
		});
		return totalBid;
	}, this);
	self.maxBid = ko.computed(function () { return 100 - this.players.length + 1 }, self);
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
	self.teams = ko.observableArray([
		new team(1, 'jersey', '*Backfield Not Included'),
		new team(2, 'Brennan', 'Pistol Shrimp All-Stars')
	]);
	self.teams()[0].players().push(new player(1, 'Phillip', 'Rivers', 'Chargers', 'QB', 20));
}

ko.applyBindings(new AppViewModel());
