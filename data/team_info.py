#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Sun Apr 16 11:54:22 2023

@author: wwelsh
"""
import pandas as pd
import os
import time
import requests

import warnings
warnings.filterwarnings("ignore")

from nba_api.stats.endpoints import leaguedashteamstats


NBA_Teams = pd.read_json('Color_Key.json')
NBA_Teams = NBA_Teams[['NBA_Team_Name','Fill_Color','Border_Color',
                       'Team_1']].rename(columns = {'Fill_Color':'Color_1',
                                            'Border_Color':'Color_2',
                                            'Team_1':'Team_ID',
                                            'NBA_Team_Name':'TEAM_NAME'})
                                                    
                                           
NBA_Files = pd.read_csv('NBA_Data_File_Locations.csv')  
NBA_Teams = NBA_Teams.merge(NBA_Files, how = 'outer', on = 'Team_ID')                                                 
Team_Stats = leaguedashteamstats.LeagueDashTeamStats(measure_type_detailed_defense = 'Advanced',timeout = 60)   
TS_DF = Team_Stats.get_data_frames()[0]
TS_DF.loc[TS_DF['TEAM_NAME']=='LA Clippers', 'TEAM_NAME'] = 'Los Angeles Clippers'

Team_DF = NBA_Teams.merge(TS_DF, how ='outer')      
Team_DF.to_json('Team_Info.json', orient = 'records')         
Team_DF.to_csv('Team_Info.csv', index = False)                                  