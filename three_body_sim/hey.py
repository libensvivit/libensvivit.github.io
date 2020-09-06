import numpy as np
#from js import document

def remap(x, in_min, in_max, out_min, out_max):
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min

def rand(r1, r2, n):
    return remap(np.random.rand(1, n), 0, 1, r1, r2)[0]

def getInitConditions():
    m = rand(5, 120, 3)
    #rad = m**0.8 #(6.3, 29.9)
    m *= 2e30
    rad = rand(10, 10, 3)
    rad *= 7e8

    pos1 = rand(-10, 10, 2)

    def getPosition2(pos1):
        accept2 = False
        while not accept2:
            pos2 = rand(-10, 10, 2)
            dist12 = ((pos1[0]-pos2[0])**2+(pos1[1]-pos2[1])**2)**(1/2)
            if (dist12*1.5e11) > (rad[0] + rad[1]): #they aren't touching
                accept2 = True
        return pos2

    pos2 = getPosition2(pos1)

    def getPosition3(pos1, pos2):
        accept3 = False
        while not accept3:
            pos3 = rand(-10, 10, 2)
            dist13 = ((pos1[0]-pos3[0])**2+(pos1[1]-pos3[1])**2)**(1/2)
            dist23 = ((pos2[0]-pos3[0])**2+(pos2[1]-pos3[1])**2)**(1/2)
            if (dist13*1.5e11) > (rad[0]+rad[2]) and (dist23*1.5e11) > (rad[1]+rad[2]): #3rd isn't touching either
                accept3 = True
        return pos3

    pos3 = getPosition3(pos1, pos2)
    
    pos1 *= 1.5e11
    pos2 *= 1.5e11
    pos3 *= 1.5e11

    v = rand(-7e4, 7e4, 6)
    r = np.array([*pos1, *pos2, *pos3, *v])

    return r, rad, m

def dR(r, m):
    G = 6.67408313131313e-11
    M1, M2, M3 = m
    X1, X2, X3 = r[0], r[2], r[4]
    Y1, Y2, Y3 = r[1], r[3], r[5]

    c1, c2, c3 = m*G

    r12 = ((X1-X2)**2 + (Y1-Y2)**2)**(1/2)
    r13 = ((X1-X3)**2 + (Y1-Y3)**2)**(1/2)
    r23 = ((X2-X3)**2 + (Y2-Y3)**2)**(1/2)

    V1X, V2X, V3X = r[6], r[8], r[10]
    V1Y, V2Y, V3Y = r[7], r[9], r[11]

    dx1 = -(c2*(X1-X2)/(r12**3))-(c3*(X1-X3)/(r13**3))
    dx2 = -(c1*(X2-X1)/(r12**3))-(c3*(X2-X3)/(r23**3))
    dx3 = -(c1*(X3-X1)/(r13**3))-(c2*(X3-X2)/(r23**3))
    dy1 = -(c2*(Y1-Y2)/(r12**3))-(c3*(Y1-Y3)/(r13**3))
    dy2 = -(c1*(Y2-Y1)/(r12**3))-(c3*(Y2-Y3)/(r23**3))
    dy3 = -(c1*(Y3-Y1)/(r13**3))-(c2*(Y3-Y2)/(r23**3))

    return np.array([V1X, V1Y, V2X, V2Y, V3X, V3Y, dx1, dy1, dx2, dy2, dx3, dy3])

def getLimits(X, Y, padding):
    xMin = np.amin([np.amin(X[0]), np.amin(X[1]), np.amin(X[2])])
    xMax = np.amax([np.amax(X[0]), np.amax(X[1]), np.amax(X[2])])

    yMin = np.amin([np.amin(Y[0]), np.amin(Y[1]), np.amin(Y[2])])
    yMax = np.amax([np.amax(Y[0]), np.amax(Y[1]), np.amax(Y[2])])

    xlims = [xMin - padding, xMax + padding]
    ylims = [yMin - padding, yMax + padding]

    return xlims, ylims

def generate3Body(stopCond, numSteps):
    tStop = stopCond[0]*365*24*3600
    sepStop = stopCond[1]*1.5e11
    stop = False
    currentT = 0
    t = np.linspace(0, tStop, numSteps+1)
    stepSize = tStop/numSteps

    r, rad, m = getInitConditions()

    i = 0
    stopT = t[-1]
    collision = False
    x1 = np.zeros(len(t))
    y1 = np.zeros(len(t))
    x2 = np.zeros(len(t))
    y2 = np.zeros(len(t))
    x3 = np.zeros(len(t))
    y3 = np.zeros(len(t))

    min12 = rad[0] + rad[1]
    min13 = rad[0] + rad[2]
    min23 = rad[1] + rad[2]

    while not stop:
        if(currentT >= stopT or i > numSteps + 1): stop = True
        elif(i > numSteps + 1):
            stop = True
            print("Error: Shouldn't have gotten here.")
        else:
            x1[i], y1[i], x2[i], y2[i], x3[i], y3[i] = r[0:6]

            k1 = stepSize*dR(r,        m)
            k2 = stepSize*dR(r + k1/2, m)
            k3 = stepSize*dR(r + k2/2, m)
            k4 = stepSize*dR(r + k3,   m)
            r += (k1 + 2*k2 + 2*k3 + k4)/6

            # Tried calculating everything in canvas size but got an error and it is very slow
            #x1[i], y1[i], x2[i], y2[i], x3[i], y3[i] = remap(r[0:6], -1.5e12, 1.5e12, 0, 512)
            #rad = remap(rad/7e8, 6.3, 29.9, 10, 30)

            min12 = rad[0] + rad[1]
            min13 = rad[0] + rad[2]
            min23 = rad[1] + rad[2]

            sep12 = ((x1[i]-x2[i])**2+(y1[i]-y2[i])**2)**(1/2)
            sep13 = ((x1[i]-x3[i])**2+(y1[i]-y3[i])**2)**(1/2)
            sep23 = ((x3[i]-x2[i])**2+(y3[i]-y2[i])**2)**(1/2)

            if(sep13 < min12 or sep13 < min13 or sep23 < min23 or sep12 > sepStop or sep13 > sepStop or sep23 > sepStop):
                #if(sep12 < min12 or sep13 < min13 or sep23 < min23):
                    #print("COLLISION OCCURED!")
                    #print(f"sep12 {sep12}, sep13 {sep13}, sep23 {sep23}")
                    #print(f"min12 {min12}, min13 {min13}, min23 {min23}")
                    #collision = True
                
                stop = True
                t = np.linspace(0, currentT, i)
                x1 = x1[:i]
                y1 = y1[:i]
                x2 = x2[:i]
                y2 = y2[:i]
                x3 = x3[:i]
                y3 = y3[:i]
            i += 1
            currentT += stepSize
    return [[x1, y1, x2, y2, x3, y3], t, m, rad, collision]  


def getInteresting3Body(stopCond, numSteps):
    yearSec = 365*24*3600
    interesting = False
    minTime = 10
    maxTime = stopCond[0]
    sepStop = stopCond[11]
    #counter = document.getElementById("iter")
    print("Searching for interesting three body. Please be patient...")
    for i in range(1, 10000):
        #counter.innerHTML = f" --> {i}"
        [plotData, t, m, rad, collision] = generate3Body([maxTime, sepStop], numSteps)
        if(t[-1]/yearSec > minTime and len(t) != numSteps+1): interesting = True
        if(interesting):
            print(f"Found interesting configuration after {i} iterations!")
            return [plotData, t, m, rad, collision]


def getReadyForPlot():
    [plotData, t, m, rad, collision] = getInteresting3Body([50, 120], 2000)
    #print(len(plotData[0]))

    X = np.asarray([plotData[0], plotData[2], plotData[4]])
    Y = np.asarray([plotData[1], plotData[3], plotData[5]])

    X = remap(X, -1.5e12, 1.5e12, 0, 512)
    Y = remap(Y, -1.5e12, 1.5e12, 0, 512)

    limits = getLimits(X, Y, 200)

    X = remap(X, limits[0][0], limits[0][1], 0, 512)
    Y = remap(Y, limits[1][0], limits[1][1], 0, 512)

    #rad = remap(rad/7e8, 6.3, 29.9, 5, 15)
    rad /= 7e8
    #print("Now you should see something.")
    return [X, Y, rad, t]