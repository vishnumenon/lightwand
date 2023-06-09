import { SERVER_URL } from "@/util/constants";
import { getJSONFromStream } from "@/util/transfers";
import React, { useMemo, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { activeProject, activeProposal } from "../ProjectEditor/editor-state";
import { toast } from "react-hot-toast";
import Loader from "../Loader/Loader";
import classNames from "classnames";
import discord from "@/assets/discord-mark.svg";
import Image from "next/image";

export interface ErrorTooltipProps {
  error: Error;
  componentName: string;
  title?: string;
  onLoadingStateChange?: (loading: boolean) => void;
}

function ErrorTooltip({
  error,
  componentName,
  title,
  onLoadingStateChange,
}: ErrorTooltipProps) {
  const project = useRecoilValue(activeProject);
  const setProposal = useSetRecoilState(activeProposal);
  const [loading, setLoading] = useState(false);

  const errorString = useMemo(() => {
    let str = error.stack ?? error.message;
    if (str.split("\n").length > 3) {
      str = str.split("\n").slice(0, 3).join("\n") + "\n...";
    }
    if (error.cause) {
      str += "\n" + error.cause;
    }
    return str;
  }, [error]);

  async function autoFix(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (!project) return;
    setLoading(true);
    onLoadingStateChange?.(true);
    const component = project.files.find((f) => f.path === componentName);
    const stackTraceComponentName = error.stack
      ?.split("\n")[1]
      ?.match(/\/files\/([A-Za-z]+)\?/)?.[1];
    const stackTraceComponent = stackTraceComponentName
      ? project.files.find((f) => f.path === stackTraceComponentName)
      : undefined;

    try {
      const request = {
        error: errorString,
      };
      const res = await fetch(
        `${SERVER_URL}/api/projects/${project.id}/files/${
          stackTraceComponent ? stackTraceComponentName : componentName
        }/revisions`,
        {
          method: "POST",
          body: JSON.stringify(request),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      const json = await getJSONFromStream(res);
      if (json.status === "error") {
        console.error(json);
        throw new Error(json.error);
      }

      if (component && json.update) {
        setProposal({
          message: json.message,
          file: stackTraceComponent ?? component,
          request,
          update: json.update,
        });
      }
    } catch (e) {
      toast.error("Failed to auto-fix, please fix manually.");
    } finally {
      e.preventDefault();
      e.stopPropagation();
      setLoading(false);
      onLoadingStateChange?.(false);
    }
  }

  return (
    <div className="bg-red-700 text-left m-2 p-2 text-xs rounded-lg shadow-md text-white">
      <div className="font-semibold flex flex-row pb-2 items-center">
        <div className="flex-1 text-base pl-2">{title ?? "Error Details"}</div>
        <button
          className={classNames(
            "px-4 py-2 text-sm rounded-md bg-red-500 hover:bg-red-600 inline-flex flex-row gap-2 items-center disabled:opacity-50 cursor-pointer disabled:cursor-default disabled:hover:bg-red-500"
          )}
          onClick={loading ? undefined : autoFix}
          disabled={loading}
        >
          {loading && <Loader className="text-red-800 fill-white w-4" />}
          Auto-Fix
        </button>
      </div>
      <pre className="text-xs p-2 overflow-auto bg-red-800 rounded-lg ">
        {errorString}
      </pre>
      <div className="py-2">
        <span className="font-semibold">Stuck on an error?</span> Post in the
        Lightrail Discord, we're happy to help!{" "}
        <a
          className={classNames(
            "font-semibold ml-2 px-2 py-1 text-xs rounded-md bg-red-500 hover:bg-red-600 inline-flex flex-row gap-2 items-center cursor-pointer"
          )}
          onClick={() => window.open("https://discord.gg/57bNyxgb7g", "_blank")}
          href="https://discord.gg/57bNyxgb7g"
          target="_blank"
        >
          <Image
            className="invert"
            alt={"Discord Logo"}
            src={discord}
            height={8}
          />{" "}
          Join Discord
        </a>
      </div>
    </div>
  );
}

export default ErrorTooltip;
