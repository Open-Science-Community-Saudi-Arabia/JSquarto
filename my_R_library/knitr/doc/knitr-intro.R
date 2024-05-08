## ----show-off, tidy=TRUE------------------------------------------------------
options(digits=4)
rnorm(20)
fit=lm(dist~speed, data=cars)
b=coef(fit)

## ----echo=FALSE---------------------------------------------------------------
knitr::kable(summary(fit)$coefficients)

## ----graphics, fig.cap='A scatterplot with a regression line.'----------------
par(mar=c(4, 4, 1, .1))
plot(cars, pch = 20)
abline(fit, col = 'red')

## ----echo=FALSE, results='asis', warning=FALSE--------------------------------
print(citation('knitr'), style = 'html')

