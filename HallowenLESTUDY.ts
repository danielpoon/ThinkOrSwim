# TD Ameritrade IP Company, Inc. (c) 2012-2017
# https://tlc.thinkorswim.com/center/reference/Tech-Indicators/strategies/E-K/Halloween.html
# used for ira/403b long term strategies/buy and hold strategies

input price = close;
input length = 30;

plot entry = GetMonth() == 10 and price > Average(price, length);
plot exit = GetMonth() == 5;

entry.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);
entry.AssignValueColor(Color.GREEN);

exit.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_DOWN);
exit.AssignValueColor(Color.RED);