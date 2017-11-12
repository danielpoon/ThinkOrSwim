###InSynce 30 minute LE
insynclite()[1] <= -55
###InSynce 30 minute LE

###InSynce Daily LE
#insynclite()[0] <= -55
###InSynce Daily LE

###HALLOWEEN LE
#input price = close;
#input length = 30;
#plot entry = GetMonth() == 10 and price > Average(price, length);
###HALLOWEEN LE