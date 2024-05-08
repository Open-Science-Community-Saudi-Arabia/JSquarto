## ----cool, results='asis'-----------------------------------------------------
library(knitr)
kable(mtcars, 'html', table.attr='id="mtcars_table"')

## ----boring, results='asis'---------------------------------------------------
kable(head(mtcars), 'html')

