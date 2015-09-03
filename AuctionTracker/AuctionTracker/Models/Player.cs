using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace AuctionTracker.Models
{
	public class Player
	{
		[JsonProperty("id")]
		public int ID { get; set; }

		[JsonProperty("firstName")]
		public string FirstName { get; set; }

		[JsonProperty("lastName")]
		public string LastName { get; set; }

		[JsonProperty("fullName")]
		public string FullName { get; set; }

		[JsonProperty("nflTeam")]
		public string NflTeam { get; set; }

		[JsonProperty("position")]
		public string Position { get; set; }

		[JsonProperty("auctionAmount")]
		public int AuctionAmount { get; set; }
	}
}