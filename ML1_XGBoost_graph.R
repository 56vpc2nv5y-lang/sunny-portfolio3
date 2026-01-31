library(tidyverse)
library(GGally)
library(dplyr)
# 1. 加载必要的包
library(readxl)
library(ggplot2)
library(dplyr)
library(GGally)

# 2. 从 Excel 文件读取数据
model_data <- read_excel("C:/Users/立早/Desktop/datamining/project/graph.xlsx")

# 3. 查看数据确认是否成功读取
head(model_data)
view(model_data)
# 4. MCC Bar Chart: Ranking models by MCC with color gradient for visual emphasis
ggplot(model_data, aes(x = reorder(Model, MCC), y = MCC, fill = MCC)) +
  geom_bar(stat = "identity") +
  scale_fill_gradient(low = "#9ECAE1", high = "#08306B") +  # 改成蓝色调
  coord_flip() +
  labs(
    title = "Model MCC Performance Ranking",
    subtitle = "Matthews Correlation Coefficient — Overall Performance Metric",
    x = "Model",
    y = "MCC"
  ) +
  theme_minimal() +
  geom_text(aes(label = round(MCC, 3)), hjust = -0.2, size = 3)

#4.1 
# 改进版MCC排名条形图
ggplot(model_data, aes(x = reorder(Model, MCC), y = MCC, fill = MCC)) +
  geom_bar(stat = "identity", width = 0.7, alpha = 0.9) +  # 调整宽度和透明度
  scale_fill_gradientn(
    colors = c("#9ECAE1", "#6BAED6", "#4292C6", "#2171B5", "#08519C", "#08306B"),
    name = "MCC Score",
    guide = guide_colorbar(barwidth = 0.8, barheight = 8)
  ) +
  coord_flip() +
  labs(
    title = "Model Performance Ranking by MCC",
    subtitle = "Matthews Correlation Coefficient - Higher values indicate better overall performance",
    x = NULL,  # 移除X轴标题，让图表更简洁
    y = "MCC Score"
  ) +
  theme_minimal(base_size = 14) +
  theme(
    axis.text.y = element_text(face = "bold", size = 11, color = "black"),
    axis.text.x = element_text(size = 10, color = "black"),
    axis.title.x = element_text(face = "bold", size = 12, margin = margin(t = 10)),
    plot.title = element_text(face = "bold", size = 16, hjust = 0.5, margin = margin(b = 8)),
    plot.subtitle = element_text(size = 12, hjust = 0.5, color = "gray40", margin = margin(b = 15)),
    panel.grid.major.y = element_blank(),  # 移除水平网格线
    panel.grid.major.x = element_line(color = "grey90"),
    panel.grid.minor = element_blank(),
    legend.position = "right",
    legend.title = element_text(face = "bold", size = 10),
    legend.text = element_text(size = 9),
    plot.background = element_rect(fill = "white", color = NA),
    panel.background = element_rect(fill = "white", color = NA)
  ) +
  # 改进文本标签：在条形内部显示，白色文字加阴影效果
  geom_text(
    aes(label = sprintf("%.3f", MCC), 
        x = reorder(Model, MCC), 
        y = ifelse(MCC < max(MCC)*0.1, MCC + 0.02, MCC - 0.02)),  # 小数值放外面，大数值放里面
    color = ifelse(model_data$MCC < max(model_data$MCC)*0.15, "black", "white"),
    size = 3.2,
    fontface = "bold",
    hjust = ifelse(model_data$MCC < max(model_data$MCC)*0.1, 0, 1)
  ) +
  # 添加数值参考线
  geom_vline(xintercept = seq(0.5, length(unique(model_data$Model)) + 0.5, 1), 
             color = "grey90", size = 0.1) +
  # 确保Y轴从0开始
  scale_y_continuous(expand = expansion(mult = c(0, 0.05)))


# 5. Precision-Recall Scatter Plot: Shows tradeoff with MCC reflected in point size and color
ggplot(model_data, aes(x = Recall, y = Precision, size = MCC, color = MCC)) +
  geom_point(alpha = 0.7) +
  geom_text(aes(label = Model), vjust = -0.8, size = 2.5, check_overlap = TRUE) +
  scale_color_gradient(low = "#9ECAE1", high = "#08306B") +
  scale_size(range = c(3, 8)) +
  labs(
    title = "Precision-Recall Tradeoff Analysis",
    subtitle = "Point size and color represent MCC value",
    x = "Recall",
    y = "Precision"
  ) +
  theme_minimal() +
  xlim(0.3, 0.9) +
  ylim(0.4, 0.8)


# 6. Prepare data for Parallel Coordinate Plot: Select key metrics and standardize them for comparison
key_metrics <- model_data %>%
  select(Model, MCC, F1, Precision, Recall, Accuracy) %>%
  mutate(across(-Model, scale))  # Standardize metrics to mean=0, sd=1

# 7. Parallel Coordinate Plot: Compare multiple standardized metrics across models
ggparcoord(
  key_metrics,
  columns = 2:6,
  groupColumn = 1,
  alphaLines = 0.8
) +
  theme_minimal() +
  labs(
    title = "Multi-metric Model Performance Comparison",
    x = "Evaluation Metrics",
    y = "Standardized Scores"
  ) +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))

# 8. Optional: Transform data into long format for boxplot visualization
model_data_long <- model_data %>%
  pivot_longer(cols = -Model, names_to = "Metric", values_to = "Value")

# 9. Boxplot: Distribution of metrics across models with jittered points by model
ggplot(model_data_long, aes(x = Metric, y = Value)) +
  geom_boxplot(fill = "#9ECAE1", alpha = 0.6) +
  geom_jitter(aes(color = Model), width = 0.2, alpha = 0.7) +
  theme_minimal() +
  labs(
    title = "Distribution of Metrics Across Models (MCC, F1, Precision, Recall, Accuracy)",
    x = "Metric",
    y = "Metric Value"
  ) +
  theme(axis.text.x = element_text(angle = 45, hjust = 1))



library(readxl)
library(ggplot2)
library(reshape2)
library(dplyr)
library(scales)

# 读取数据
df <- read_excel("C:/Users/立早/Desktop/datamining/project/graph.xlsx")

# 转换数据格式
df_melt <- melt(df, id.vars = "Model", measure.vars = c("MCC", "F1", "Precision", "Recall", "Accuracy"))

# 对每个指标单独进行归一化
df_normalized <- df_melt %>%
  group_by(variable) %>%
  mutate(
    normalized_value = (value - min(value)) / (max(value) - min(value))
  ) %>%
  ungroup()

# 按MCC平均值对模型排序
model_order <- df_melt %>%
  filter(variable == "MCC") %>%
  group_by(Model) %>%
  summarise(mean_value = mean(value)) %>%
  arrange(mean_value) %>%
  pull(Model)

df_normalized$Model <- factor(df_normalized$Model, levels = model_order)

# 自适应文字颜色版本
ggplot(df_normalized, aes(x = variable, y = Model, fill = normalized_value)) +
  geom_tile(color = "white", size = 0.8, width = 0.9, height = 0.9) +
  scale_fill_gradientn(
    colors = c("#F7FBFF", "#DEEBF7", "#C6DBEF", "#9ECAE1", "#6BAED6", "#4292C6", "#2171B5", "#08519C", "#08306B"),
    name = "Relative\nPerformance",
    labels = c("Worst", "Average", "Best"),
    breaks = c(0, 0.5, 1)
  ) +
  labs(
    title = "Model Performance Heatmap",
    x = "Performance Metrics", 
    y = "Model Name",
  ) +
  theme_minimal(base_size = 14) +
  theme(
    axis.text.x = element_text(angle = 0, hjust = 1, face = "bold", size = 12),
    axis.text.y = element_text(face = "bold", size = 11),
    axis.title.x = element_text(face = "bold", size = 13, margin = margin(t = 10)),
    axis.title.y = element_text(face = "bold", size = 13, margin = margin(r = 10)),
    plot.title = element_text(hjust = 0.5, face = "bold", size = 18, margin = margin(b = 10)),
    plot.subtitle = element_text(hjust = 0.5, size = 12, color = "gray40", margin = margin(b = 15)),
    plot.caption = element_text(hjust = 0, size = 10, color = "gray40", margin = margin(t = 10)),
    panel.grid = element_blank(),
    legend.position = "right",
    legend.title = element_text(face = "bold", size = 11),
    legend.text = element_text(size = 10),
    plot.background = element_rect(fill = "white", color = NA),
    panel.background = element_rect(fill = "white", color = NA)
  ) +
  # 自适应文字颜色：深色背景用白色文字，浅色背景用黑色文字
  geom_text(aes(label = sprintf("%.3f", value), 
                color = ifelse(normalized_value > 0.5, "white", "black")), 
            size = 3.5, fontface = "bold", show.legend = FALSE) +
  scale_color_identity() +
  # 为每个指标添加分隔线
  geom_vline(xintercept = seq(1.5, length(unique(df_normalized$variable))-0.5, 1), 
             color = "gray70", size = 0.3)

