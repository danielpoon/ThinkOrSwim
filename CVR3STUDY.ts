#The CVR3 is a short-term trading strategy using the CBOE Volatility Index ($VIX) to time the S&P 500. Developed by Larry Connors and Dave Landry, this strategy looks for overextended VIX readings to signal excessive fear or greed in the stock market. Excessive fear is used to generate buy signals in this mean-reversion strategy, while excessive greed is used to generate sell signals.
#http://stockcharts.com/school/doku.php?id=chart_school:trading_strategies:cvr3_vix_market_timi

declare lower;

input ppo_ema1 = 1; # standard is 1
input ppo_ema2 = 10;  # standard is 10
input price_ema = 10;  # standard is 10
input h_res = 15; # standard is 10
input l_res = -15; # standard is -10
input lag=1;  # standard is 1
input sym = "VIX";

def vix_op = open(sym);
def vix_cl = close(sym);
def vix_hi = high(sym);
def vix_lo = low(sym);

def e1 = MovAvgExponential(vix_cl, ppo_ema1);
def e2 = MovAvgExponential(vix_cl, ppo_ema2);
def ema = MovAvgExponential(vix_cl, price_ema);
def p = (e1 - e2) / e2 * 100;

plot ppo = -Average(p, lag); # inverse of normal calc
ppo.SetLineWeight(3);
ppo.SetDefaultColor(Color.CYAN);

plot buysignal = if  ppo < l_res and vix_lo > ema and vix_cl > vix_op then l_res else Double.NaN;
buysignal.SetPaintingStrategy(PaintingStrategy.POINTS);
buysignal.SetLineWeight(3);
buysignal.SetDefaultColor(Color.YELLOW);

plot sellsignal = if ppo > h_res and vix_hi < ema  and vix_cl < vix_op then h_res else Double.NaN;
sellsignal.SetPaintingStrategy(PaintingStrategy.POINTS);
sellsignal.SetLineWeight(3);
sellsignal.SetDefaultColor(Color.YELLOW);

plot h = h_res;
h.SetDefaultColor(Color.GRAY);
plot l = l_res;
l.SetDefaultColor(Color.GRAY);
