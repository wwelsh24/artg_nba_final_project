#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Thu Apr 13 22:45:40 2023

@author: wwelsh
"""
import pandas as pd
import os
import time
import requests

import warnings
warnings.filterwarnings("ignore")

from nba_api.stats.endpoints import playercareerstats
from nba_api.stats.endpoints import leaguedashlineups
from nba_api.stats.endpoints import leagueplayerondetails
from nba_api.stats.endpoints import leaguedashplayerbiostats
from nba_api.stats.endpoints import playerindex


NBA_Teams = pd.read_csv('NBA_Team_IDs.csv')
NBA_Teams.rename(columns = {'Current_BBRef_Team_Abbreviation':'Team_ID'}, inplace = True)



#player_list = leaguedashplayerbiostats.LeagueDashPlayerBioStats(timeout = 60)
player_list = playerindex.PlayerIndex(timeout = 60)
pl_dict1 = player_list.nba_responce.get_normalized_dict()
pl_df = pd.DataFrame(pl_dict1.get('PlayerIndex'))
pl_df['PLAYER_NAME'] = pl_df['PLAYER_FIRST_NAME']+' '+pl_df['PLAYER_LAST_NAME']
pl_lim = pl_df[['PERSON_ID','PLAYER_NAME','POSITION']].rename(columns = {'PERSON_ID':'VS_PLAYER_ID', 'PLAYER_NAME':'GROUP_NAME'})
pl_lim.to_json('Player_List_2022-23.json', orient = 'records')
print('Player List Success')
time.sleep(15)


for t in range(0,NBA_Teams.shape[0]):
    tid = NBA_Teams.iloc[t]['NBA_Current_Link_ID']
    team_name = NBA_Teams.iloc[t]['Spotrac_Current_Link_ID']
    print(f'Querying {team_name} 1 Player Lineups')
    success = False
    while not success:
        try:
            tp_summary = leagueplayerondetails.LeaguePlayerOnDetails(team_id = tid, measure_type_detailed_defense = 'Advanced',timeout = 60)
            print('Success')
            success = True
        except requests.exceptions.ReadTimeout:
            time.sleep(10)
            print('Retrying')
            tp_summary = leagueplayerondetails.LeaguePlayerOnDetails(team_id = tid, measure_type_detailed_defense = 'Advanced',timeout = 60)
    
    tp_df = tp_summary.get_data_frames()[0]

    team_players = tp_df.merge(pl_lim, on = 'VS_PLAYER_ID', how = 'left').rename(columns = {'VS_PLAYER_ID':'GROUP_ID'})
    # team_players = team_players[['GROUP_ID','GROUP_NAME','E_OFF_RATING','E_DEF_RATING','E_NET_RATING',
    #                              'OFF_RATING','DEF_RATING','NET_RATING']]
    team_players['Player_Count'] = 1
    time.sleep(15)
    
    
    
    Complete_Lineup_Data = pd.DataFrame()
    for n in range(2,6):
        print(f'Querying {team_name} {n} Player Lineups')
        success = False
        while not success:
            try:
                Lineups = leaguedashlineups.LeagueDashLineups(measure_type_detailed_defense = 'Advanced',
                                                              team_id_nullable=tid,
                                                              group_quantity = str(n),
                                                              timeout = 60)
                print('Success')
                success = True
            except requests.exceptions.ReadTimeout:
                time.sleep(15)
                print('Retrying')
                Lineups = leaguedashlineups.LeagueDashLineups(measure_type_detailed_defense = 'Advanced',
                                                              team_id_nullable=tid,
                                                              group_quantity = str(n),
                                                              timeout = 60)
        Lineups_DF = Lineups.get_data_frames()[0]
        Lineups_DF['Player_Count'] = n
        Complete_Lineup_Data = Complete_Lineup_Data.append(Lineups_DF)
        time.sleep(15)
        
    
    roster_loc = 'team_rosters/4.16.23_'+team_name+'_Roster_Data.csv'
    # roster = commonteamroster.CommonTeamRoster(team_id = tid, timeout = 60)
    # roster_df = roster.get_data_frames()[0]
    team_players.to_csv(roster_loc, index = False)
    
    Complete_Lineup_Data = Complete_Lineup_Data.append(team_players)
    data_loc = 'team_data/4.16.23_'+team_name+'_Lineup_Data.csv'
    NBA_Teams.loc[NBA_Teams['NBA_Current_Link_ID'] == tid,'Data_Location'] = 'data/'+data_loc
    NBA_Teams.loc[NBA_Teams['NBA_Current_Link_ID'] == tid,'Roster_Location'] = 'data/'+roster_loc
    
    Complete_Lineup_Data.to_csv(data_loc, index = False)
    time.sleep(15)

NBA_Teams.to_csv('NBA_Data_File_Locations.csv',index = False)

