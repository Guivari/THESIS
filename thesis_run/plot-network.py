import pathlib

import pandas as pandas
import plotly.express as px
from kaleido.scopes.plotly import PlotlyScope
scope = PlotlyScope()
import os
import subprocess
import yaml

template = "plotly_white"

hash = subprocess.check_output("git rev-parse --short HEAD", shell=True).decode().strip()
data = pathlib.Path(os.path.abspath(__file__)).parent.joinpath("output", hash, "0").absolute()
output_dir = data.parent.joinpath("plots")
os.makedirs(output_dir, exist_ok=True)

output_dirs = os.listdir(data)

frames = []
for d in [data.joinpath(x) for x in output_dirs]:
    with open(d.joinpath("config.yml")) as f:
        config = yaml.safe_load(f)
    data_file = d.joinpath("pecosa-forge.log")
    df = pandas.read_csv(data_file, sep="\t")
    df["config"] = config["policy"]
    df["policy"] = config["policy"]
    df["iteration"] = config["_iteration"]
    df["index"] = config["_index"]
    frames.append(df)
    
df = pandas.concat(frames)

df["timestamp"] = df.groupby(["iteration", "config"])["timestamp"].transform(lambda x: x - x.min())
df["net.packets_sent.eth4"] = df.groupby(["iteration", "config"])["net.packets_sent.eth4"].transform(
    lambda x: x - x.min())

df["net.packets_sent.eth0"] = df.groupby(["iteration", "config"])["net.packets_sent.eth0"].transform(
    lambda x: x - x.min())

# # It takes about 65 seconds to connect all players; cut.
df["timestamp"] = df["timestamp"].transform(lambda x: x - 60000)
df = df[df["timestamp"] >= 0]

fig = px.line(df, x="timestamp", y="net.packets_sent.eth4", color="config", line_group="iteration", template=template,
              labels={
                  "timestamp": "time (ms)", "net.packets_sent.eth4": "packets sent", "config": "forge_server eth4"})
with open(str(output_dir.joinpath("packets_over_time_eth4.pdf")), "wb") as f:
    f.write(scope.transform(fig, format="pdf"))


fig = px.line(df, x="timestamp", y="net.packets_sent.eth0", color="config", line_group="iteration", template=template,
              labels={
                  "timestamp": "time (ms)", "net.packets_sent.eth0": "packets sent", "config": "forge_server eth0"})
with open(str(output_dir.joinpath("packets_over_time_eth0.pdf")), "wb") as f:
    f.write(scope.transform(fig, format="pdf"))


# df = df.groupby(["iteration", "config"], as_index=False).max()
# df["packets_per_second"] = df["net.packets_sent.eth4"] / (df["timestamp"] / 1000)
# fig = px.box(df, x="config", y="packets_per_second", template=template,
#              labels={"config": "Forge Server", "packets_per_second": "packets per second"})
# fig.update_yaxes(rangemode="tozero")
# with open(str(output_dir.joinpath("packets_per_second_over_policy.pdf")), "wb") as f:
#     f.write(scope.transform(fig, format="pdf"))
