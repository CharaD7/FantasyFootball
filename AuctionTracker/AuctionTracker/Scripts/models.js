///// <reference path="knockout-3.3.0.js" />

function team(owner, name) {
	var self = this;
	self.owner = ko.observable(owner);
	self.name = ko.observable(name);
	self.players = ko.observableArray([]);
};

function player() {
	var self = this;
	self.firstName = ko.observable();
	self.lastName = ko.observable();
	self.fullName = ko.computed(function () { return this.firstName + ' ' + this.lastName }, self);
	self.nflTeam = ko.observable();
	self.position = ko.observable();
}

function AppViewModel() {
	var self = this;
	self.teams = ko.observableArray([new team('Christopher', 'Backfield Not Included')]);
}

ko.applyBindings(new AppViewModel());
