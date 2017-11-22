# https://tlc.thinkorswim.com/center/reference/Tech-Indicators/strategies/E-K/Halloween.html

input price = close;
input SMAlength = 30;
input EMAlength = 300;
input dollars = 10000;

def Shares = AbsValue(Round(dollars / close));

AddOrder(OrderType.SELL_AUTO, GetMonth() == 5 AND price < Average(price, SMAlength)
AND Average(price, SMAlength) <= movavgExponential(price, EMAlength), tickColor = GetColor(1), arrowColor = GetColor(1), name = "HalloweenSE", tradeSize = Shares);
AddOrder(OrderType.BUY_TO_CLOSE, GetMonth() == 10, tickColor = GetColor(2), arrowColor = GetColor(2), name = "HalloweenSX", tradeSize = Shares);
