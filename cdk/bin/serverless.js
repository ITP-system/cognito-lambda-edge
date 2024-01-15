#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = require("aws-cdk-lib");
const auth_edge_stack_1 = require("../lib/auth-edge-stack");
const auth_ui_stack_1 = require("../lib/auth-ui-stack");
const app_stack_1 = require("../lib/app-stack");
const auth_challenge_stack_1 = require("../lib/auth-challenge-stack");
const app = new cdk.App();
const stage = app.node.tryGetContext("stage");
if (stage == undefined)
    throw new Error(`Please specify stage with context option. ex) cdk deploy -c stage=dev`);
const context = app.node.tryGetContext(stage);
if (context == undefined)
    throw new Error("Invalid stage.");
const authEdgeStack = new auth_edge_stack_1.AuthEdgeStack(app, `AuthEdgeStack-${stage}`, {
    env: {
        account: context["env"]["account"],
        region: "us-east-1",
    },
});
const authUiStack = new auth_ui_stack_1.AuthUiStack(app, `AuthUiStack-${stage}`, {
    env: {
        account: context["env"]["account"],
        region: context["env"]["region"],
    },
});
const authChallengeStack = new auth_challenge_stack_1.AuthChallengeStack(app, `AuthChallengeStack-${stage}`, {
    env: {
        account: context["env"]["account"],
        region: context["env"]["region"],
    },
});
const appStack = new app_stack_1.AppStack(app, `AppStack-${stage}`, {
    env: {
        account: context["env"]["account"],
        region: context["env"]["region"],
    },
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVybGVzcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlcnZlcmxlc3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsdUNBQXFDO0FBQ3JDLG1DQUFtQztBQUNuQyw0REFBdUQ7QUFDdkQsd0RBQW1EO0FBQ25ELGdEQUE0QztBQUM1QyxzRUFBaUU7QUFFakUsTUFBTSxHQUFHLEdBQUcsSUFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7QUFFMUIsTUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDOUMsSUFBSSxLQUFLLElBQUksU0FBUztJQUNwQixNQUFNLElBQUksS0FBSyxDQUNiLHVFQUF1RSxDQUN4RSxDQUFDO0FBRUosTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDOUMsSUFBSSxPQUFPLElBQUksU0FBUztJQUFFLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztBQUU1RCxNQUFNLGFBQWEsR0FBRyxJQUFJLCtCQUFhLENBQUMsR0FBRyxFQUFFLGlCQUFpQixLQUFLLEVBQUUsRUFBRTtJQUNyRSxHQUFHLEVBQUU7UUFDSCxPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNsQyxNQUFNLEVBQUUsV0FBVztLQUNwQjtDQUNGLENBQUMsQ0FBQztBQUVILE1BQU0sV0FBVyxHQUFHLElBQUksMkJBQVcsQ0FBQyxHQUFHLEVBQUUsZUFBZSxLQUFLLEVBQUUsRUFBRTtJQUMvRCxHQUFHLEVBQUU7UUFDSCxPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNsQyxNQUFNLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQztLQUNqQztDQUNGLENBQUMsQ0FBQztBQUVILE1BQU0sa0JBQWtCLEdBQUcsSUFBSSx5Q0FBa0IsQ0FDL0MsR0FBRyxFQUNILHNCQUFzQixLQUFLLEVBQUUsRUFDN0I7SUFDRSxHQUFHLEVBQUU7UUFDSCxPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNsQyxNQUFNLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQztLQUNqQztDQUNGLENBQ0YsQ0FBQztBQUVGLE1BQU0sUUFBUSxHQUFHLElBQUksb0JBQVEsQ0FBQyxHQUFHLEVBQUUsWUFBWSxLQUFLLEVBQUUsRUFBRTtJQUN0RCxHQUFHLEVBQUU7UUFDSCxPQUFPLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUNsQyxNQUFNLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLFFBQVEsQ0FBQztLQUNqQztDQUNGLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCBcInNvdXJjZS1tYXAtc3VwcG9ydC9yZWdpc3RlclwiO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0IHsgQXV0aEVkZ2VTdGFjayB9IGZyb20gXCIuLi9saWIvYXV0aC1lZGdlLXN0YWNrXCI7XG5pbXBvcnQgeyBBdXRoVWlTdGFjayB9IGZyb20gXCIuLi9saWIvYXV0aC11aS1zdGFja1wiO1xuaW1wb3J0IHsgQXBwU3RhY2sgfSBmcm9tIFwiLi4vbGliL2FwcC1zdGFja1wiO1xuaW1wb3J0IHsgQXV0aENoYWxsZW5nZVN0YWNrIH0gZnJvbSBcIi4uL2xpYi9hdXRoLWNoYWxsZW5nZS1zdGFja1wiO1xuXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuXG5jb25zdCBzdGFnZSA9IGFwcC5ub2RlLnRyeUdldENvbnRleHQoXCJzdGFnZVwiKTtcbmlmIChzdGFnZSA9PSB1bmRlZmluZWQpXG4gIHRocm93IG5ldyBFcnJvcihcbiAgICBgUGxlYXNlIHNwZWNpZnkgc3RhZ2Ugd2l0aCBjb250ZXh0IG9wdGlvbi4gZXgpIGNkayBkZXBsb3kgLWMgc3RhZ2U9ZGV2YFxuICApO1xuXG5jb25zdCBjb250ZXh0ID0gYXBwLm5vZGUudHJ5R2V0Q29udGV4dChzdGFnZSk7XG5pZiAoY29udGV4dCA9PSB1bmRlZmluZWQpIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgc3RhZ2UuXCIpO1xuXG5jb25zdCBhdXRoRWRnZVN0YWNrID0gbmV3IEF1dGhFZGdlU3RhY2soYXBwLCBgQXV0aEVkZ2VTdGFjay0ke3N0YWdlfWAsIHtcbiAgZW52OiB7XG4gICAgYWNjb3VudDogY29udGV4dFtcImVudlwiXVtcImFjY291bnRcIl0sXG4gICAgcmVnaW9uOiBcInVzLWVhc3QtMVwiLFxuICB9LFxufSk7XG5cbmNvbnN0IGF1dGhVaVN0YWNrID0gbmV3IEF1dGhVaVN0YWNrKGFwcCwgYEF1dGhVaVN0YWNrLSR7c3RhZ2V9YCwge1xuICBlbnY6IHtcbiAgICBhY2NvdW50OiBjb250ZXh0W1wiZW52XCJdW1wiYWNjb3VudFwiXSxcbiAgICByZWdpb246IGNvbnRleHRbXCJlbnZcIl1bXCJyZWdpb25cIl0sXG4gIH0sXG59KTtcblxuY29uc3QgYXV0aENoYWxsZW5nZVN0YWNrID0gbmV3IEF1dGhDaGFsbGVuZ2VTdGFjayhcbiAgYXBwLFxuICBgQXV0aENoYWxsZW5nZVN0YWNrLSR7c3RhZ2V9YCxcbiAge1xuICAgIGVudjoge1xuICAgICAgYWNjb3VudDogY29udGV4dFtcImVudlwiXVtcImFjY291bnRcIl0sXG4gICAgICByZWdpb246IGNvbnRleHRbXCJlbnZcIl1bXCJyZWdpb25cIl0sXG4gICAgfSxcbiAgfVxuKTtcblxuY29uc3QgYXBwU3RhY2sgPSBuZXcgQXBwU3RhY2soYXBwLCBgQXBwU3RhY2stJHtzdGFnZX1gLCB7XG4gIGVudjoge1xuICAgIGFjY291bnQ6IGNvbnRleHRbXCJlbnZcIl1bXCJhY2NvdW50XCJdLFxuICAgIHJlZ2lvbjogY29udGV4dFtcImVudlwiXVtcInJlZ2lvblwiXSxcbiAgfSxcbn0pO1xuIl19