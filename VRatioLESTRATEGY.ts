input ma1 = 9;
input ma_len2 = 3;
input buy_threshold = 0.95;
input sell_threshold = 0.9;
input sym1 = "VIX3M";
input sym2 = "VIX";
input ADX_length = 14;
input ADX_threshold = 15;
input average_type = AverageType.EXPONENTIAL;
input dollars = 10000;

def Shares = AbsValue(Round(dollars / close));

def cl1 = close(sym1);
def cl2 = close(sym2);

def adx = ADX(length = ADX_length);

def ma_vRatio = Round(MovingAverage(average_type, cl2 / cl1, ma1), 3);
def ma_vRatio2 = Round(MovingAverage(average_type, ma_vRatio, ma_len2), 3);
def buysignal = (ma_vRatio[2] >= buy_threshold and ma_vRatio[1] >= buy_threshold and ma_vRatio <= buy_threshold)
  or (ma_vRatio[10] > sell_threshold and ma_vRatio[1] > sell_threshold and ma_vRatio <= sell_threshold)
  or (adx > ADX_threshold and ma_vRatio <= sell_threshold and highest(ma_vRatio,10) < sell_threshold and ma_vRatio < ma_vRatio2 and ma_vRatio[1] >= ma_vRatio2[1]);
def exit = (ma_vRatio[1] < sell_threshold and ma_vRatio >= sell_threshold)
  or (ma_vRatio[1] == sell_threshold and ma_vRatio > sell_threshold)
  or (ma_vRatio[1] < buy_threshold and ma_vRatio >= buy_threshold)
  or (adx <= ADX_threshold and ma_vRatio > ma_vRatio2);

AddOrder(OrderType.BUY_AUTO, buysignal, tickcolor = GetColor(1), arrowcolor = GetColor(1), name = "VRLE", tradeSize = Shares, price = close);
AddOrder(OrderType.SELL_TO_CLOSE, exit, tickcolor = GetColor(2), arrowcolor = GetColor(2), name = "VRLX", tradeSize = Shares, price = close);
