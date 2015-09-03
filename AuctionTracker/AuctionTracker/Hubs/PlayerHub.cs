using AuctionTracker.Models;
using Microsoft.AspNet.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AuctionTracker.Hubs
{
	public class PlayerHub : Hub
	{
		public void AuctionPlayer(Player player, Team team)
		{
			Clients.All.playerAuctioned(player, team);
		}

		public void GetAll()
		{
			Clients.Caller.receivedPlayers(new List<Player>() {
				new Player() { ID = 1, FirstName = "Phillip", LastName = "Rivers", FullName = "Rivers, Phillip", NflTeam = "Chargers", Position = "QB" },
				new Player() { ID = 2, FirstName = "Russell", LastName = "Wilson", FullName = "Wilson, Russel", NflTeam = "Seahawks", Position  = "QB" },
				new Player() { ID = 3, FirstName = "Kirk", LastName = "Cousins", FullName = "Cousins, Kirk", NflTeam = "Redskins", Position = "QB" },
				new Player() { ID = 4, FirstName = "Reggie", LastName = "Bush", FullName = "Bush, Reggie", NflTeam = "49ers", Position = "RB" },
			});
		}
	}
}