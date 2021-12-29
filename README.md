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
2.  `cd luogu-motaki-server && pnpm i`
3.  使用 [luogu-motaki-plan-editor](https://github.com/ouuan/luogu-motaki-plan-editor) 将图片转为 `motaki-plan.json`，放在 server 所在的目录下；
4.  `pnpm run start`

### 使用可执行文件

1.  在 [Releases](https://github.com/ouuan/luogu-motaki-server/releases) 中下载可执行文件；
2.  使用 [luogu-motaki-plan-editor](https://github.com/ouuan/luogu-motaki-plan-editor) 将图片转为 `motaki-plan.json`；
3.  在 `motaki-plan.json` 所在的目录运行 `luogu-motaki-server`。

## 配置

配置通过环境变量修改。

-   `LUOGU_MOTAKI_SERVER_PORT`: 端口，默认为 15762（只是一个随机数而已）。

## API

如果你只是想使用这个东西，你不需要知道它的 API 长啥样。

### `GET /job/new`

-   说明：获取一个新任务。

-   参数：

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
        status: 'success';
        uuid: string;
        x: number;
        y: number;
        col: number;
        timeLimit: number;
    }
    ```

    表示你需要做一个任务，这个任务的 uuid 是 `uuid`，你需要在 `(x, y)` 这个点处画颜色 `col`，你必须在 UNIX 时间戳 `timeLimit`（单位为毫秒）前完成这个任务。

    若所有任务都完成了（画完了），你会收到如下回复：

    ```typescript
    {
        status: 'finished';
    }
    ```

    若你被封禁了，你会收到如下回复：

    ```typescript
    {
        status: 'blocked';
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

-   参数：

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
        status: 'success' | 'failed' | 'unverified' | 'error';
        blockedUntil: number;
    }
    ```

    `status` 表示这次任务成功/失败/未认证（没有从绘板官方获取到这个点被画了这个颜色）/错误。其中错误可能是因为：报告超出了时间限制，uuid 不正确，报告用的 ip 地址和获取任务时不同。

    `blockedUntil` 表示你在这个时间戳（单位为毫秒）之前被封禁了，如果为 0 或者小于当前时间表示没有被封禁。

-   注意：为了确认任务真的完成了，在虚假报告或出现异常时，这个 API 可能会需要最长 30 秒才返回结果。

### `GET /plan`

-   说明：获取 `motaki-plan.json`
-   参数：无
-   回复：`motaki-plan.json` 的内容
