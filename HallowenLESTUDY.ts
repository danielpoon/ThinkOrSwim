# https://tlc.thinkorswim.com/center/reference/Tech-Indicators/strategies/E-K/Halloween.html

input price = close;
input SMAlength = 30;
input EMAlength = 300;
input dollars = 10000;

def Shares = AbsValue(Round(dollars / close));

AddOrder(OrderType.BUY_AUTO, GetMonth() == 10 AND price > Average(price, SMAlength)
AND Average(price, SMAlength) >= movavgExponential(price, EMAlength), tickColor = GetColor(1), arrowColor = GetColor(1), name = "HalloweenLE", tradeSize = Shares);
AddOrder(OrderType.SELL_TO_CLOSE, GetMonth() == 5, tickColor = GetColor(2), arrowColor = GetColor(2), name = "HalloweenLX", tradeSize = Shares);
