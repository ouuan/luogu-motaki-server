# Luogu Motaki Server

(Work in progress :construction:)

洛谷冬日绘板助手 Luogu Motaki 的服务端，[项目主仓库](https://github.com/ouuan/luogu-motaki)

## 快速开始

### 使用 docker-compose（推荐）

1.  下载 [`docker-compose.yml`](docker-compose.yml) 到一个新目录；
2.  使用 [luogu-motaki-plan-editor](https://github.com/ouuan/luogu-motaki-plan-editor) 将图片转为 `motaki-plan.json` 放在这个目录下；
3.  在这个目录运行 `docker-compose up -d`。

### 使用 node

需要 Node.js v14 以上，最好是 v16 或 v17。

1.  `git clone https://github.com/ouuan/luogu-motaki-server`
2.  `cd luogu-motaki-server && pnpm i && pnpm build`
3.  使用 [luogu-motaki-plan-editor](https://github.com/ouuan/luogu-motaki-plan-editor) 将图片转为 `motaki-plan.json`，放在 server 所在的目录下；
4.  `node .`

## 配置

配置通过环境变量修改。

-   `LUOGU_MOTAKI_SERVER_PORT`: 端口，默认为 15762（只是一个随机数而已）。
-   `LUOGU_MOTAKI_PAINTBOARD_URL`: 绘板的地址，默认为官方地址，可以填其它地址用于测试。
-   `LUOGU_MOTAKI_WS_URL`: 绘板 WebSocket 的地址，默认为官方地址，可以填其它地址用于测试。
-   `LUOGU_MOTAKI_BLOCK=false`: 关闭封禁功能。

## API

### `POST /job/new`

-   说明：获取一个新任务。

-   body：

    可以为空，表示所有方案都可以接受。

    也可以指定若干个方案：

    ```typescript
    {
        names: string[];
    }
    ```

    表示获取名称为 `names` 中的元素的方案的任务。

-   回复：

    若一切正常，你会收到如下回复：

    ```typescript
    {
        status: "success";
        uuid: string;
        x: number;
        y: number;
        color: number;
        timeLimit: number;
    }
    ```

    表示你需要做一个任务，这个任务的 uuid 是 `uuid`，你需要在 `(x, y)` 这个点处画颜色 `color`，你必须在 UNIX 时间戳 `timeLimit`（单位为毫秒）前完成这个任务。

    若所有任务都完成了（画完了），你会收到如下回复：

    ```typescript
    {
        status: "finished";
    }
    ```

    若你被封禁了，你会收到如下回复：

    ```typescript
    {
        status: "blocked";
        blockedUntil: number;
    }
    ```

    表示你在 `blockedUntil` 这个时间戳（单位为毫秒）前都无法获取新任务。

    若 `names` 中包含错误的方案名称，你会收到如下回复：

    ```typescript
    {
        status: 'not-found';
        validNames: string[];
    }
    ```

    表示合法的方案名称为 `validNames` 中的元素。

### `POST /job/finish`

-   说明：报告一个任务成功完成或失败。无论任务成功还是失败都需要报告（失败可能是因为还在冷却等原因），必须在 `timeLimit` 之前报告。如果没有即时报告，IP 会被封禁。

-   body：

    ```typescript
    {
        x: number;
        y: number;
        uuid: string;
        success: boolean;
    }
    ```

    `x`, `y`, `uuid` 表示你获取到的任务，`success` 表示任务是否成功完成。

-   回复：

    ```typescript
    {
        status: "success" | "failed" | "unverified" | "error";
        blockedUntil: number;
    }
    ```

    `status` 表示这次任务成功/失败/未认证（没有从绘板官方获取到这个点被画了这个颜色）/错误。其中错误可能是因为：报告超出了时间限制，uuid 不正确，报告用的 ip 地址和获取任务时不同。

    `blockedUntil` 表示你在这个时间戳（单位为毫秒）之前被封禁了，如果为 0 或者小于当前时间表示没有被封禁。

-   注意：为了确认任务真的完成了，在虚假报告或出现异常时，这个 API 可能会需要最长 30 秒才返回结果。

### `GET /plan`

-   说明：获取 `motaki-plan.json`
-   回复：`motaki-plan.json` 的内容

### `GET /progress`

-   说明：获取进度
-   回复：

    ```typescript
    {
      time: string;
      total: {
        finished: number;
        total: number;
      };
      tasks: {
        [name: string]: {
          finished: number;
          total: number;
        }
      };
    }
    ```

    或者 "You are querying the progress too frequently!" ，如果访问太频繁。

### `GET /count`

-   说明：获取绘制次数统计
-   回复：

    ```typescript
    {
        time: string;
        others: {
            self: number;
            others: number;
        };
        tasks: {
            [name: string]: {
                self: number;
                others: number;
            }
        };
    }
    ```

    其中 `self` 和 `others` 表示由过去 10 分钟的数据取平均值得到的由/不由本服务端绘制的 token 数量。

    或者 "Please wait until xxxx"，如果服务端启动不足 10 分钟。

    或者 "You are querying the count too frequently!" ，如果访问太频繁。
