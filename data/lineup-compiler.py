#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Wed Apr 19 02:28:56 2023

@author: wwelsh
"""
import pandas as pd

file_locations = pd.read_csv('Team_Info.csv')
complete_data = pd.DataFrame()

file_locations['Data_Location'] = file_locations['Data_Location'].str.replace('data/', '',n=1, regex=False)
for n in range(0,file_locations.shape[0]):
    team_data = pd.read_csv(file_locations.iloc[n]['Data_Location'])
    filtered_team_data = team_data.loc[team_data['Player_Count']==5]
    filtered_team_data = filtered_team_data.loc[filtered_team_data['MIN']>=48]
    complete_data = complete_data.append(filtered_team_data)

complete_data.drop(columns = 'TEAM_NAME', inplace = True)
team_info = file_locations[['TEAM_NAME','TEAM_ID','Color_1','Color_2']]
complete_data = complete_data.merge(team_info, on = 'TEAM_ID')
complete_data.to_csv('filtered_lineup_data.csv', index = False)