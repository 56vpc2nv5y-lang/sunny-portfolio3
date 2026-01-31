# Install and load necessary packages (uncomment to install if not installed)
# install.packages("caret")
# install.packages("randomForest")
# install.packages("pROC")
# install.packages("dplyr")
# install.packages("tidyr")
# install.packages("plotly")

library(caret)
library(randomForest)
library(pROC)
library(dplyr)
library(tidyr)
library(plotly)

# Import data
data <- read.csv("C:/Users/立早/Downloads/breast+cancer/breast-cancer.data", header = FALSE, stringsAsFactors = FALSE)

# Add column names
colnames(data) <- c("Recurrence", "Age", "Menopause", "Tumor_Size", "Inv_nodes", 
                    "Node_caps", "Deg_malig", "Breast", "Breast_quad", "Irradiat")

# Data type conversion
data <- data %>%
  mutate(
    Recurrence = factor(Recurrence,
                        levels = c("no-recurrence-events", "recurrence-events"),
                        labels = c("no_recurrence_events", "recurrence_events")),
    Age = factor(Age),
    Menopause = factor(Menopause),
    Tumor_Size = factor(Tumor_Size),
    Inv_nodes = factor(Inv_nodes),
    Node_caps = factor(Node_caps),
    Deg_malig = as.integer(Deg_malig),
    Breast = factor(Breast),
    Breast_quad = factor(Breast_quad),
    Irradiat = factor(Irradiat)
  )


set.seed(123)
train_index <- createDataPartition(data$Recurrence, p = 0.8, list = FALSE)
train_data <- data[train_index, ]
test_data <- data[-train_index, ]


train_control <- trainControl(method = "cv",
                              number = 10,
                              classProbs = TRUE,
                              summaryFunction = twoClassSummary)

tuneGrid <- expand.grid(mtry = 1:9)

set.seed(123)
rf_cv_model <- train(
  Recurrence ~ .,
  data = train_data,
  method = "rf",
  metric = "ROC",
  tuneGrid = tuneGrid,
  trControl = train_control,
  ntree = 400
)

# Check best mtry
best_mtry <- rf_cv_model$bestTune$mtry
print(best_mtry)


# Set class weights: focus on improving sensitivity
final_weights <- c(no_recurrence_events = 1, recurrence_events = 3)

# Retrain model with training set using tuned mtry
rf_weighted <- randomForest(
  Recurrence ~ .,
  data = train_data,
  ntree = 400,
  mtry = best_mtry,
  classwt = final_weights
)

# Predict probabilities on test set
pred_probs <- predict(rf_weighted, test_data, type = "prob")


calculate_threshold_metrics <- function(pred_probs, actual_labels, thresholds) {
  results <- data.frame()
  
  for (th in thresholds) {
    pred_classes <- ifelse(pred_probs > th, "recurrence_events", "no_recurrence_events")
    pred_classes <- factor(pred_classes, levels = levels(actual_labels))
    
    cm <- confusionMatrix(pred_classes, actual_labels, positive = "recurrence_events")
    
    sensitivity <- cm$byClass["Sensitivity"]
    specificity <- cm$byClass["Specificity"]
    precision   <- cm$byClass["Precision"]
    f1          <- 2 * (sensitivity * precision) / (sensitivity + precision)
    
    results <- rbind(results, data.frame(
      Threshold = th,
      Sensitivity = sensitivity,
      Specificity = specificity,
      Precision = precision,
      F1 = f1
    ))
  }
  
  return(results)
}

thresholds <- seq(0.05, 0.95, by = 0.01)
results_df <- calculate_threshold_metrics(pred_probs[, "recurrence_events"], test_data$Recurrence, thresholds)

# Calculate Youden's J statistic
results_df$YoudenJ <- results_df$Sensitivity + results_df$Specificity - 1

# Find threshold with maximum J
best_index <- which.max(results_df$YoudenJ)
best_threshold <- results_df$Threshold[best_index]
best_youdenJ <- results_df$YoudenJ[best_index]

cat("Best threshold (max Youden's J):", best_threshold, "\n")
cat("Maximum Youden's J value:", best_youdenJ, "\n")

# Predict with the best threshold
final_pred <- ifelse(pred_probs[, "recurrence_events"] > best_threshold,
                     "recurrence_events", "no_recurrence_events")
final_pred <- factor(final_pred, levels = levels(test_data$Recurrence))

final_cm <- confusionMatrix(final_pred, test_data$Recurrence, positive = "recurrence_events")
print(final_cm)

# Convert to long format
results_long <- pivot_longer(results_df, cols = -Threshold, names_to = "Metric", values_to = "Value")


# Manually adjust threshold

threshold <- 0.3

final_pred <- ifelse(pred_probs[, "recurrence_events"] > threshold,
                     "recurrence_events", "no_recurrence_events")
final_pred <- factor(final_pred, levels = levels(test_data$Recurrence))

final_cm <- confusionMatrix(final_pred, test_data$Recurrence, positive = "recurrence_events")
print(final_cm)


# Interactive visualization
plot_ly(
  data = results_long,
  x = ~Threshold,
  y = ~Value,
  color = ~Metric,
  type = 'scatter',
  mode = 'lines+markers',
  text = ~paste("Metric:", Metric,
                "<br>Threshold:", round(Threshold, 2),
                "<br>Value:", round(Value, 3)),
  hoverinfo = 'text'
) %>%
  layout(
    title = "Model Performance at Different Thresholds (Interactive)",
    xaxis = list(title = "Threshold"),
    yaxis = list(title = "Metric Value"),
    shapes = list(
      # Red dashed line: Best threshold (max Youden's J)
      list(
        type = "line",
        x0 = best_threshold, x1 = best_threshold,
        y0 = 0, y1 = 1,
        line = list(color = "red", width = 2, dash = "dot")
      ),
      # Blue dashed line: Manually set threshold (threshold = 0.3)
      list(
        type = "line",
        x0 = 0.3, x1 = 0.3,
        y0 = 0, y1 = 1,
        line = list(color = "blue", width = 2, dash = "dot")
      )
    ),
    annotations = list(
      # Annotation: Position of best threshold
      list(
        x = best_threshold,
        y = 1,
        text = paste0("Best Threshold: ", round(best_threshold, 2)),
        xref = "x",
        yref = "y",
        showarrow = TRUE,
        arrowhead = 4,
        ax = 40,
        ay = -40
      ),
      # Annotation: Position of manual threshold
      list(
        x = 0.3,
        y = 1,
        text = paste0("Manually Chosen Threshold: 0.30"),
        xref = "x",
        yref = "y",
        showarrow = TRUE,
        arrowhead = 4,
        ax = 40,
        ay = -40
      )
    )
  )
