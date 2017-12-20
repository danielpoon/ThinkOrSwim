declare lower;
input ma_len = 9; # 10
input ma_len2 = 3; # 10
input res1 = 1.0;
input res2 = .95;
input res3 = .9;
input ADX_threshold = 16;
input ppo_l_res = -12;
input PAINTBARS = YES;
input sym1 = "VIX3M";
input sym2 = "VIX";
input average_type = AverageType.EXPONENTIAL;

def cl1 = close(sym1);
def cl2 = close(sym2);

# ONLY FOR BUY AND SELL SIGNALS; DEF SET FROM VRatioLE
def vix_op = open(sym2);
def vix_cl = close(sym2);
def vix_hi = high(sym2);
def vix_lo = low(sym2);

def adx = ADX();

def e1 = MovAvgExponential(vix_cl, 1);
def e2 = MovAvgExponential(vix_cl, 10);
def ema = MovAvgExponential(vix_cl, 10);
def p = (e1 - e2) / e2 * 100;
def ppo = -Average(p, 1); # inverse of normal calc
# ONLY FOR BUY AND SELL SIGNALS;DEF SET FROM VRatioLE

plot ma_vRatio = Round(MovingAverage(average_type, cl2 / cl1, ma_len), 3);

plot ma_vRatio2 = Round(MovingAverage(average_type, ma_vRatio, ma_len2), 3);
ma_vRatio2.SetLineWeight(3);
ma_vRatio2.SetDefaultColor(Color.GRAY);

def LE = (ma_vRatio[1] >= res2 and ma_vRatio <= res2)
  or (ma_vRatio[10] > res3 and ma_vRatio[1] > res3 and ma_vRatio <= res3)
  or (highest(ma_vRatio, 10) < res3 and lowest(adx,10) > ADX_threshold and ma_vRatio <= res3 and ma_vRatio < ma_vRatio2 and ma_vRatio[1] >= ma_vRatio2[1])
  or (ma_vRatio < res1 and high > low[1] and ppo < ppo_l_res and vix_lo > ema and vix_cl > vix_op and ((high - close) / (.001 + high - low) > 0.5)); #CVR3; no gaps; long red candlestick

def LX = (ma_vRatio > res1)
  or (ma_vRatio[1] < res3 and ma_vRatio >= res3 and !LE)
  or (ma_vRatio[1] < res2 and ma_vRatio >= res2 and !LE)
  or (adx <= ADX_threshold and ma_vRatio > ma_vRatio2 and !LE);

plot r1 = res1;
r1.SetLineWeight(1);
r1.SetDefaultColor(Color.RED);

plot r2 = res2;
r2.SetLineWeight(1);
r2.SetDefaultColor(Color.ORANGE);

plot r3 = res3;
r3.SetLineWeight(1);
r3.SetDefaultColor(Color.GREEN);

def signal = CompoundValue(1,if LE then 1
  else if !LE and LX and ma_vratio >= res3 and ma_vRatio>= ma_vRatio2 then -1
  else if LX then 0
  else if !LX and !LE then signal[1]
  else 0, 0);

ma_vRatio.AssignValueColor(if signal == 1 then Color.GREEN else if signal == -1 then Color.Red else Color.Gray);
ma_vRatio.SetLineWeight(3);

plot ple = if signal and !signal[1] then ma_vRatio else Double.NaN;
ple.SetPaintingStrategy(PaintingStrategy.ARROW_UP);
ple.SetLineWeight(3);
ple.SetDefaultColor(Color.GREEN);

plot plx = if !signal and signal[1] then ma_vRatio else Double.NaN;
plx.SetPaintingStrategy(PaintingStrategy.ARROW_DOWN);
plx.SetLineWeight(3);
plx.SetDefaultColor(Color.Yellow);
