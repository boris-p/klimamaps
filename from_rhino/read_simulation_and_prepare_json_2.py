import json
result = open(resFile, 'r')
fo = open("D:/temp/va_sim/foo.txt", "w")

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
        singleRadTime['time_stamp'] = timeStamp
        singleRadTime['global_rad'] = globalRad
        singleRadTime['points_rad_percent'] = []
        singleRadTime['points_rad'] = []
        
        
        for radPointValue in hourRadVals:
            HourRad = float(radPointValue)
            HourRad = int(HourRad * 100)/100
            singleRadTime['points_rad_percent'].append(int(returnRadPercent(HourRad,globalRad)))
            singleRadTime['points_rad'].append(int(HourRad))
        radSimulationRes.append(singleRadTime)
    else:
        if hour == 1:
            previousHour = radSimulationRes[hour -1]
        else:
            previousHour = radSimulationRes[(hour-1)*4]
        globalRadIntVal = (globalRad - previousHour['global_rad']) /4
        for y in range(4):
            singleRadTime = {}
            singleRadTime['time_stamp'] = timeStamp + y*900 # 900 sec = 15 minutes 
            singleRadTime['global_rad'] = previousHour['global_rad'] + globalRadIntVal * (y +1)
            singleRadTime['points_rad_percent'] = []
            singleRadTime['points_rad'] = []
            radSimulationRes.append(singleRadTime)
            
            
        for index,radPointValue in enumerate(hourRadVals):
            HourRad = float(radPointValue)
            HourRad = int(HourRad * 100)/100
            #prepare interpolation values
            radPercentDifference = (returnRadPercent(HourRad,globalRad) - previousHour['points_rad_percent'][index]) /4
            radValDifference = (HourRad - previousHour['points_rad'][index]) / 4
            
            #save 4 interpolation values - 15,30,45 (from previous hour) and 0 (current hour)
            for z in range(4):
                radSimulationRes[1 + (hour -1)*4 + z]['points_rad_percent'].append(int(previousHour['points_rad_percent'][index] + radPercentDifference *z))
                radSimulationRes[1 + (hour -1)*4 + z]['points_rad'].append(int(previousHour['points_rad'][index] + radValDifference *z))
    if hour == 200:
        jsonString = json.dumps(radSimulationRes)
        fo.write(jsonString)
    #print jsonString
    #print radSimulationRes
        fo.close()
        break

#jsonString = json.dumps(radSimulationRes)
#fo.write(jsonString)
#fo.close()