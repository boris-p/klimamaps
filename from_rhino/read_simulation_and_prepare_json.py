import json
result = open(resFile, 'r')

#  Fri, 01 Jan 2016 00:00:00 GMT
# in unix epoch time is - 1451606400
#so.. seconds from 1970
# and hour -is 3600
firstOfYear = 1451606400
yearlyRad = []

def returnRadPercent(radValue,globalRad):
    if globalRad == 0:
        return 0
    else:
        #save as a percentage (integer)
        return int(radValue/globalRad * 100)

radSimulationRes = []

for hour, line in enumerate(result):
    #global radiation from epw file
    globalRad = epwRadVals[hour]
    #timestamp for current hour
    timeStamp = firstOfYear + hour*3600
    
    hourRadVals =  line.split('  ')[1].split(' ')
    
    #for the first hour and first hour only we don't compare to the previous one (no interpolation)
    if hour == 0:
        singleRadTime = {}
        singleRadTime['global_rad'] = globalRad
        singleRadTime['time_stamp'] = timeStamp
        singleRadTime['points_rad_percent'] = []
        singleRadTime['points_rad'] = []
        
        
        for radValue in hourRadVals:
            HourRad = float(radValue)
            singleRadTime['points_rad_percent'].append(returnRadPercent(HourRad,globalRad))
            singleRadTime['points_rad'].append(HourRad)
        radSimulationRes.append(singleRadTime)
    else:
        previousHour = radSimulationRes[hour -1]
        globalRadIntVal = (globalRad - previousHour['global_rad']) /4
        for y in range(4):
            singleRadTime = {}
            singleRadTime['global_rad'] = previousHour['global_rad'] + globalRadIntVal * y
            singleRadTime['time_stamp'] = timeStamp + y*900 # 900 sec = 15 minutes 
            singleRadTime['points_rad_percent'] = []
            singleRadTime['points_rad'] = []
            
            radSimulationRes.append(singleRadTime)
            
            
        for index,radValue in enumerate(hourRadVals):
            HourRad = float(radValue)
            radValDifference = HourRad - previousHour['points_rad'][index]
            radValDifference = float(hourRadVals[j+1]) - HourRad /4
            for y in range(4):
                
            #the values for these two should be overwritten later on
            singleRadTime['points_rad_percent'] = []
            #backup if we don't have radiation in real time
            singleRadTime['points_rad'] = []
            radSimulationRes.append(singleRadTime)
        
    #obj = ''    
    #radPercent = []
    hourRadVals =  line.split('  ')[1].split(' ')
    #for now (and maybe always we'll have hourly values so interpolate get 15 minute intervals
    for j in range(len(hourRadVals) - 1):
        HourRad = float(hourRadVals[j])
        #interpolation # from 1 hour to 15 minute intervals so we need 0, 15, 30 and 45 minutes
        valDifference = float(hourRadVals[j+1]) - HourRad /4
        for z in range(4):
            radSimulationRes[hour + z]['points_rad_percent'].append(returnRadPercent(HourRad + valDifference*z,globalRad))
            radSimulationRes[hour + z]['points_rad'].append(HourRad + valDifference*z)
            #radPercent.append(returnRadPercent(HourRad + valDifference*z,globalRad))
    #adding the last element
    radPercent.append(returnRadPercent(hourRadVals[-1],globalRad))
    if hour == 15:
        print radPercent
        break
    #line = line.replace('\n', '', 10)
    #lineSeg = line.Split(' ')
    yearlyRad.append(radPercent)