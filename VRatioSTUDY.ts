declare lower;
input ma_len = 9; # 10
input ma_len2 = 3; # 10
input buy_res = .95;
input sell_res = .9;
input round = 4;
input sym1 = "VIX3M";
input sym2 = "VIX";
input average_type = AverageType.EXPONENTIAL;

def cl1 = close(sym1);
def cl2 = close(sym2);

plot ma_vRatio = round(MovingAverage(average_type, cl2 / cl1, ma_len),round);
ma_vRatio.SetLineWeight(3);
ma_vRatio.SetDefaultColor(Color.CYAN);
plot ma_vRatio2 = round(MovingAverage(average_type, ma_vRatio, ma_len2),round);
ma_vRatio2.SetLineWeight(3);
ma_vRatio2.SetDefaultColor(Color.GRAY);
plot br = buy_res;
br.SetLineWeight(1);
br.SetDefaultColor(Color.Green);
plot sr = sell_res;
sr.SetLineWeight(1);
sr.SetDefaultColor(Color.Orange);
