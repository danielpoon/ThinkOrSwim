# study(title = "CM_Laguerre PPO PercentileRank Mkt Tops & Bottoms", shorttitle="CM_Laguerre PPO PctRank Tops-Bottoms", overlay=false, precision=1)
# Great for Spotting Tops & Bottoms.
# Reference 1: http://www.wisestocktrader.com/indicators/4898-cm-laguerre-ppo-percentilerank-mkt-tops-bottoms
# Reference 2: https://jp.tradingview.com/script/ngr0qRmw-CM-Laguerre-PPO-PercentileRank-Mkt-Tops-Bottoms/
# Adapted on Jan/29/2017 from the CM_Laguerre PPO PercentileRank V2 Mkt Tops & Bottoms
# by jaimepinto@rogers.com
declare lower;
#Inputs:
input pctile    = 95; #title="Percentile Threshold Extreme Value, Exceeding Creates Colored Histogram")
input wrnpctile = 80; # title="Percentile Threshold Warning Value, Exceeding Creates Colored Histogram")
input Short     = 0.4; # title="PPO Setting")
input Long      = 0.8; #title="PPO Setting")
input lkbT      = 50; # title="Look Back Period For 'Tops' Percent Rank is based off of?")
input lkbB      = 50; # title="Look Back Period For 'Bottoms' Percent Rank is based off of?")
input sl        = yes; # title="Show Threshold Line?")
input swl       = yes; # title="Show Warning Threshold Line?")
plot zeroLine = 0;
zeroLine.SetDefaultColor(color.GRAY);
# Nz(x): converts Null (Null/Nan/Infinity) to zero
script nz {
   # https://www.amibroker.com/guide/afl/nz.html
   input x = close;
   #plot retutn = x;
   plot return = if isNaN(x) OR isInfinite(x) then 0 else x;
}
# PercentRank(array,range)
script PercentRank {
   # https://www.amibroker.com/guide/afl/percentrank.html
   input Data       = close;
   input Periods    = 200;
   plot return = 100 * (fold i = 1 to Periods with count do count + (if Data > getValue(Data, i) then 1 else 0)) / Periods;
}
# Laguerre PPO Code from TheLark
script lag {
   input g  = 0.4;
   input p  = hl2;
   def L0;
   def L1;
   def L2;
   def L3;
   L0 = (1 - g)*p+g*L0[1];
   L1 = -g*L0+L0[1]+g*L1[1];
   L2 = -g*L1+L1[1]+g*L2[1];
   L3 = -g*L2+L2[1]+g*L3[1];
   plot f = (L0 + 2 * L1 + 2 * L2 + L3) / 6;
}
#plot PercentRankPlot = PercentRank(close, 200);
#plot lagPlot = lag(0.4, hl2);
def lmas = lag(Short, hl2);
def lmal = lag(Long, hl2);
def pctileB = pctile * -1;
def wrnpctileB = wrnpctile * -1;
# PPO Plot
def ppoT = (lmas - lmal)/lmal*100;
def ppoB = (lmal - lmas)/lmal*100;
# PercentRank of PPO
plot pctRankT = percentrank(ppoT, lkbT);
plot pctRankB = -1*percentrank(ppoB, lkbB);
# Color Definition of Columns
pctRankT.SetPaintingStrategy(PaintingStrategy.HISTOGRAM);
pctRankT.SetLineWeight(3);
pctRankT.AssignValueColor(
        if sl and pctRankT >= pctile then Color.RED
   else if swl and pctRankT >= wrnpctile and pctRankT < pctile then Color.DARK_RED
   else Color.DARK_GRAY
);
pctRankB.SetPaintingStrategy(PaintingStrategy.HISTOGRAM);
pctRankB.SetLineWeight(3);
pctRankB.AssignValueColor(
        if sl and pctRankB <= pctileB then Color.GREEN
   else if swl and pctRankB <= wrnpctileB and pctRankB > pctileB then Color.DARK_GREEN
   else Color.DARK_GRAY
);
